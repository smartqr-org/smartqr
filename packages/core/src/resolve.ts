// The resolver is responsible for taking a rules payload (JSON),
// evaluating it for the current context (OS/lang/date/rollout),
// and then attempting to execute the most appropriate action
// (deeplink on mobile; web on desktop; fallback after a timeout).

import { RulesSchema, type Rules, type Context, type Evaluation } from './rules'
import { evaluateRules } from './evaluate'

// We support two navigation "modes". `assign` keeps history,
// `replace` swaps the current entry (useful for resolvers).
type NavKind = 'assign' | 'replace'

// Public result returned to the caller (handy for logging/tests).
export type ResolveResult = {
  evaluation: Evaluation // what evaluateRules decided (os/lang/target/reason)
  deeplink?: string      // app scheme (myapp://...) chosen for the device
  web?: string           // web URL selected
  fallback?: string      // ultimate fallback if deeplink fails
  used: 'deeplink' | 'web' | 'fallback' | 'none' // what we actually tried in the end
  error?: unknown        // transport error, if any
}

// Public options to customize behavior + testability knobs.
export type ResolveOptions = {
  // How to fetch/obtain the rules JSON for a given id (e.g. "promo123").
  loadRules: (id: string) => Promise<unknown>
  // Optional explicit id; if omitted, we read it from `location.search`.
  id?: string
  // Extra evaluation context (userId/now/lang) to augment auto-detected values.
  context?: Context
  // Milliseconds to wait before considering the deeplink failed and firing fallback.
  // Typical values: 800–1500ms. Default: 1200ms.
  timeoutMs?: number
  // Desktop behavior: if true, go straight to web when OS === Desktop. Default: true.
  preferWebOnDesktop?: boolean
  // assign vs replace navigation strategy. Default: 'assign'.
  navigation?: NavKind
  // Lifecycle hooks around navigation. Fail-safe (exceptions ignored).
  onBefore?: (info: ResolveResult) => void
  onAfter?: (info: ResolveResult) => void
  // Injectable navigation fn (great for unit tests / headless envs).
  // Defaults to window.location.assign/replace.
  navigate?: (url: string, kind: NavKind) => void
}

// Extract `id` from the current URL (?id=...), with a safe fallback.
// Works in browsers; in SSR/Node we return "default".
function getIdFromLocation(): string {
  try {
    const href =
      typeof location !== 'undefined' ? location.href : 'http://localhost/?id=default'
    const id = new URL(href).searchParams.get('id')
    return id ?? 'default'
  } catch {
    // Malformed URL or no window/location available.
    return 'default'
  }
}

// Given an evaluation, pick the relevant URIs for this device.
// `evaluateRules` already normalized `target`, so we only branch on OS.
function chooseUris(e: Evaluation) {
  const { os, target } = e
  const deeplink =
    os === 'iOS' ? target.ios : os === 'Android' ? target.android : undefined
  const web = target.web
  const fallback = target.fallback ?? target.web // default fallback to web
  return { deeplink, web, fallback }
}

// Default navigation that hits the browser History API.
// Kept small and isolated so we can override it in tests.
function defaultNavigate(url: string, kind: NavKind) {
  if (typeof window === 'undefined' || typeof location === 'undefined') return
  if (kind === 'replace') window.location.replace(url)
  else window.location.assign(url)
}

/**
 * Load rules → evaluate → attempt to execute the best action.
 * This function is resilient to SSR, uses a timer heuristic for deeplink
 * fallback, and exposes hooks for analytics and custom navigation.
 */
export async function resolveAndExecute(opts: ResolveOptions): Promise<ResolveResult> {
  // 1) Normalize options and set defaults.
  const {
    id = getIdFromLocation(),
    loadRules,
    context,
    timeoutMs = 1200,
    preferWebOnDesktop = true,
    navigation = 'assign',
    onBefore,
    onAfter,
    navigate = defaultNavigate
  } = opts

  // 2) Load and validate the rules payload.
  //    Zod validation keeps the surface area tight and predictable.
  const raw = await loadRules(id)
  const rules = RulesSchema.parse(raw) as Rules

  // 3) Evaluate conditions (OS/lang/date/rollout) to pick a target.
  const evaluation = evaluateRules(rules, context)
  const { deeplink, web, fallback } = chooseUris(evaluation)

  // 4) Notify observers *before* any navigation occurs.
  const baseResult: ResolveResult = {
    evaluation,
    deeplink,
    web,
    fallback,
    used: 'none'
  }
  try {
    onBefore?.(baseResult)
  } catch {
    // Hooks must never break navigation; ignore exceptions on purpose.
  }

  // 5) Environment guard:
  // In non-browser environments we cannot use defaultNavigate (it needs window/location),
  // but if the caller injected a custom `navigate`, we can still proceed (e.g. tests, SSR).
  const isBrowser = typeof window !== 'undefined'
  const usingDefaultNav = navigate === defaultNavigate
  if (!isBrowser && usingDefaultNav) {
    const r = { ...baseResult, used: 'none' as const }
    try { onAfter?.(r) } catch {}
    return r
  }

  // 6) Desktop policy: if configured, prefer going directly to web.
  if (evaluation.os === 'Desktop' && preferWebOnDesktop && web) {
    navigate(web, navigation)
    const r = { ...baseResult, used: 'web' as const }
    try { onAfter?.(r) } catch {}
    return r
  }

  // 7) Mobile-first flow:
  //    Try the deeplink. If the app doesn't take focus quickly,
  //    assume it failed and go to `fallback` after `timeoutMs`.
  if (deeplink) {
    const isDoc = typeof document !== 'undefined'

    return await new Promise<ResolveResult>((resolve) => {
      let finished = false
      const settle = (used: ResolveResult['used']) => {
        if (finished) return
        finished = true
        const r: ResolveResult = { ...baseResult, used }
        try { onAfter?.(r) } catch {}
        resolve(r) // <-- resolve the promise right here
      }

      // Fallback timer
      const t = setTimeout(() => {
        if (!finished && fallback) {
          navigate(fallback, navigation)
          settle('fallback') // <-- resolve immediately on fallback
        }
      }, timeoutMs)

      try {
        // Try deeplink
        navigate(deeplink, navigation)

        // Cancel fallback if page loses visibility (app opened)
        const onVis = () => {
          if (isDoc && document.hidden) {
            clearTimeout(t)
            if (isDoc) document.removeEventListener('visibilitychange', onVis)
            settle('deeplink') // <-- resolve immediately on deeplink success
          }
        }
        if (isDoc) document.addEventListener('visibilitychange', onVis, { once: true })
      } catch {
        // navigate() threw -> go to fallback or finish
        clearTimeout(t)
        if (fallback) {
          navigate(fallback, navigation)
          settle('fallback')
        } else {
          settle('none')
        }
      }

      // Backstop: some WebViews never fire visibilitychange nor error
      setTimeout(() => {
        settle('deeplink') // best-effort assumption
      }, timeoutMs + 250)
    })
  }

  // 8) No deeplink path available → try web first, else fallback.
  if (web) {
    navigate(web, navigation)
    const r = { ...baseResult, used: 'web' as const }
    try { onAfter?.(r) } catch {}
    return r
  }
  if (fallback) {
    navigate(fallback, navigation)
    const r = { ...baseResult, used: 'fallback' as const }
    try { onAfter?.(r) } catch {}
    return r
  }

  // 9) Nothing to do (misconfigured rules). We still return a structured result.
  const r = { ...baseResult, used: 'none' as const }
  try { onAfter?.(r) } catch {}
  return r
}
