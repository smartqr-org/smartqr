import { RulesSchema, type Rules, type Context, type Evaluation } from './rules'
import { evaluateRules } from './evaluate'

// ---------------------------
// DOM-like shims (sin lib DOM)
// ---------------------------
type LocationShim = {
  href: string
  assign?: (url: string) => void
  replace?: (url: string) => void
}
type DocumentShim = {
  addEventListener?: (type: string, cb: () => void) => void
  removeEventListener?: (type: string, cb: () => void) => void
  hidden?: boolean
}
type NavigatorShim = { userAgent?: string; language?: string }
type WindowShim = {
  location?: LocationShim
  document?: DocumentShim
  navigator?: NavigatorShim
}

const _g = (typeof globalThis !== 'undefined' ? globalThis : {}) as Record<string, unknown>

const location = (
  (_g.location as LocationShim) ??
  ({ href: 'http://localhost/?id=default' } as LocationShim)
)
const document = (_g.document as DocumentShim) ?? ({} as DocumentShim)
const window = ((_g.window as WindowShim) ?? { location }) as WindowShim

// Some WebViews never fire visibilitychange or explicit errors.
// We use a small backstop to resolve the race in best-effort manner.
export const BACKSTOP_TIMEOUT_MS = 250

// We support two navigation "modes". `assign` keeps history,
// `replace` swaps the current entry (useful for resolvers).
type NavKind = 'assign' | 'replace'

// Public result returned to the caller (handy for logging/tests).
export type ResolveResult = {
  evaluation: Evaluation // what evaluateRules decided (os/lang/target/reason)
  deeplink?: string // app scheme (myapp://...) chosen for the device
  web?: string // web URL selected
  fallback?: string // Ultimate fallback if deeplink fails
  used: 'deeplink' | 'web' | 'fallback' | 'none' // what we actually tried in the end
  error?: unknown // transport error, if any
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
    const href = typeof location?.href === 'string' ? location.href : 'http://localhost/?id=default'
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
  const loc = window?.location
  if (!loc) return
  if (kind === 'replace' && typeof loc.replace === 'function') loc.replace(url)
  else if (typeof loc.assign === 'function') loc.assign(url)
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
  try {
    onBefore?.(baseResult)
  } catch {
    /* swallow */
  }

  const hasBrowserLocation = !!window?.location
  const usingDefaultNav = navigate === defaultNavigate

  if (!hasBrowserLocation && usingDefaultNav) {
    const r = { ...baseResult, used: 'none' as const }
    try {
      onAfter?.(r)
    } catch {
      /* swallow */
    }
    return r
  }

  if (evaluation.os === 'Desktop' && preferWebOnDesktop && web) {
    navigate(web, navigation)
    const r = { ...baseResult, used: 'web' as const }
    try {
      onAfter?.(r)
    } catch {
      /* swallow */
    }
    return r
  }

  if (deeplink) {
    const doc = window?.document

    return await new Promise<ResolveResult>((resolve) => {
      let finished = false
      const settle = (used: ResolveResult['used']) => {
        if (finished) return
        finished = true
        const r: ResolveResult = { ...baseResult, used }
        try {
          onAfter?.(r)
        } catch {
          /* swallow */
        }
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
          if (doc?.hidden === true) {
            clearTimeout(t)
            doc?.removeEventListener?.('visibilitychange', onVis)
            settle('deeplink')
          }
        }
        doc?.addEventListener?.('visibilitychange', onVis)
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
    try {
      onAfter?.(r)
    } catch {
      /* swallow */
    }
    return r
  }
  if (fallback) {
    navigate(fallback, navigation)
    const r = { ...baseResult, used: 'fallback' as const }
    try {
      onAfter?.(r)
    } catch {
      /* swallow */
    }
    return r
  }

  const r = { ...baseResult, used: 'none' as const }
  try {
    onAfter?.(r)
  } catch {
    /* swallow */
  }
  return r
}
