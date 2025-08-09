// The resolver is responsible for taking a rules payload (JSON),
// evaluating it for the current context (OS/lang/date/rollout),
// and then attempting to execute the most appropriate action
// (deeplink on mobile; web on desktop; fallback after a timeout).

import { RulesSchema, type Rules, type Context, type Evaluation } from './rules'
import { evaluateRules } from './evaluate'

// Some WebViews never fire visibilitychange or explicit errors.
// We use a small backstop to resolve the race in best-effort manner.
export const BACKSTOP_TIMEOUT_MS = 250

// We support two navigation "modes". `assign` keeps history,
// `replace` swaps the current entry (useful for resolvers).
type NavKind = 'assign' | 'replace'

// Public result returned to the caller (handy for logging/tests).
export type ResolveResult = {
  evaluation: Evaluation // what evaluateRules decided (os/lang/target/reason)
  deeplink?: string      // app scheme (myapp://...) chosen for the device
  web?: string           // web URL selected
  fallback?: string      // Ultimate fallback if deeplink fails
  used: 'deeplink' | 'web' | 'fallback' | 'none' // what we actually tried in the end
  error?: unknown        // transport error, if any
}

// Public options to customize behavior + testability knobs.
export type ResolveOptions = {
  loadRules: (id: string) => Promise<unknown>
  id?: string
  context?: Context
  timeoutMs?: number
  preferWebOnDesktop?: boolean
  navigation?: NavKind
  onBefore?: (info: ResolveResult) => void
  onAfter?: (info: ResolveResult) => void
  navigate?: (url: string, kind: NavKind) => void
}

function getIdFromLocation(): string {
  try {
    const href =
      typeof location !== 'undefined' ? location.href : 'http://localhost/?id=default'
    const id = new URL(href).searchParams.get('id')
    return id ?? 'default'
  } catch {
    return 'default'
  }
}

function chooseUris(e: Evaluation) {
  const { os, target } = e
  const deeplink =
    os === 'iOS' ? target.ios : os === 'Android' ? target.android : undefined
  const web = target.web
  const fallback = target.fallback ?? target.web
  return { deeplink, web, fallback }
}

function defaultNavigate(url: string, kind: NavKind) {
  if (typeof window === 'undefined' || typeof location === 'undefined') return
  if (kind === 'replace') window.location.replace(url)
  else window.location.assign(url)
}

export async function resolveAndExecute(opts: ResolveOptions): Promise<ResolveResult> {
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

  const raw = await loadRules(id)
  const rules = RulesSchema.parse(raw) as Rules

  const evaluation = evaluateRules(rules, context)
  const { deeplink, web, fallback } = chooseUris(evaluation)

  const baseResult: ResolveResult = {
    evaluation,
    deeplink,
    web,
    fallback,
    used: 'none'
  }
  try { onBefore?.(baseResult) } catch {}

  const isBrowser = typeof window !== 'undefined'
  const usingDefaultNav = navigate === defaultNavigate
  if (!isBrowser && usingDefaultNav) {
    const r = { ...baseResult, used: 'none' as const }
    try { onAfter?.(r) } catch {}
    return r
  }

  if (evaluation.os === 'Desktop' && preferWebOnDesktop && web) {
    navigate(web, navigation)
    const r = { ...baseResult, used: 'web' as const }
    try { onAfter?.(r) } catch {}
    return r
  }

  if (deeplink) {
    const isDoc = typeof document !== 'undefined'

    return await new Promise<ResolveResult>((resolve) => {
      let finished = false
      const settle = (used: ResolveResult['used']) => {
        if (finished) return
        finished = true
        const r: ResolveResult = { ...baseResult, used }
        try { onAfter?.(r) } catch {}
        resolve(r)
      }

      const t = setTimeout(() => {
        if (!finished && fallback) {
          navigate(fallback, navigation)
          settle('fallback')
        }
      }, timeoutMs)

      try {
        navigate(deeplink, navigation)

        const onVis = () => {
          if (isDoc && document.hidden) {
            clearTimeout(t)
            if (isDoc) document.removeEventListener('visibilitychange', onVis)
            settle('deeplink')
          }
        }
        if (isDoc) document.addEventListener('visibilitychange', onVis)
      } catch {
        clearTimeout(t)
        if (fallback) {
          navigate(fallback, navigation)
          settle('fallback')
        } else {
          settle('none')
        }
      }

      setTimeout(() => {
        settle('deeplink')
      }, timeoutMs + BACKSTOP_TIMEOUT_MS)
    })
  }

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

  const r = { ...baseResult, used: 'none' as const }
  try { onAfter?.(r) } catch {}
  return r
}
