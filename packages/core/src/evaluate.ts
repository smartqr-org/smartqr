import { type Rules, type Rule, type Context, type Evaluation, type OS } from './rules'

type NavigatorShim = { userAgent: string; language: string }
const navigator: NavigatorShim = ((globalThis as unknown as Record<string, unknown>).navigator ??
  { userAgent: '', language: 'en' }) as NavigatorShim

/** Detect OS using a simple UA check (best-effort; tests can inject Context.os) */
function detectOS(): OS {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return 'Desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return 'Android'
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS'
  return 'Desktop'
}

/** Check if a given rule matches the provided runtime context */
function matches(rule: Rule, ctx: Required<Pick<Context, 'os' | 'lang' | 'now' | 'rolloutSeed'>>): boolean {
  const cond = rule.if
  if (!cond) return true // no conditions = always match

  // OS condition
  if (cond.os && cond.os.length > 0) {
    // ensure ctx.os is one of the allowed OS values
    if (!cond.os.includes(ctx.os)) return false
  }

  // Language condition (case-insensitive)
  if (cond.lang && cond.lang.length > 0) {
    const langLower = (ctx.lang ?? '').toLowerCase()
    const hasLang = cond.lang.some((l) => l.toLowerCase() === langLower)
    if (!hasLang) return false
  }

  // DateRange condition (inclusive bounds)
  if (cond.dateRange) {
    const { start, end } = cond.dateRange
    if (start && ctx.now < new Date(start)) return false
    if (end && ctx.now > new Date(end)) return false
  }

  // Rollout condition
  if (typeof cond.rollout === 'number') {
    // If rollout is X%, we match only when seed ∈ [0, X]
    if (ctx.rolloutSeed > cond.rollout) return false
  }

  return true
}

/** Main evaluation: returns the first matching rule's target or the default target */
export function evaluateRules(rulesDoc: Rules, context?: Context): Evaluation {
  const os = context?.os ?? detectOS()
  // Normalize lang; if missing and navigator is present, try navigator.language
  const lang = (context?.lang ?? (typeof navigator !== 'undefined' ? navigator.language : undefined))?.toLowerCase()
  const now = context?.now ?? new Date()
  const rolloutSeed =
    typeof context?.rolloutSeed === 'number'
      ? context.rolloutSeed
      : Math.floor(Math.random() * 100)

  const ctx: Required<Pick<Context, 'os' | 'lang' | 'now' | 'rolloutSeed'>> = {
    os,
    lang: lang ?? '',
    now,
    rolloutSeed,
  }

  // Find first matching rule
  const idx = rulesDoc.rules.findIndex((r) => matches(r, ctx))

  if (idx >= 0) {
    const rule = rulesDoc.rules[idx]
    return {
      os,
      lang,
      nowISO: now.toISOString(),
      matchedRuleIndex: idx,
      reason: rule.reason,
      target: rule.target,
    }
  }

  // Fallback to default target if provided
  if (rulesDoc.default) {
    return {
      os,
      lang,
      nowISO: now.toISOString(),
      matchedRuleIndex: -1,
      reason: rulesDoc.default.reason,
      target: rulesDoc.default.target,
    }
  }

  // No match and no default: return an empty target (resolveAndExecute will handle it)
  return {
    os,
    lang,
    nowISO: now.toISOString(),
    matchedRuleIndex: -1,
    reason: 'no-match',
    target: {},
  }
}
