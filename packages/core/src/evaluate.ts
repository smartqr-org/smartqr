import UAParser from 'ua-parser-js'
import { hashFNV1a } from './hash'
import type { Rules, Context, Evaluation } from './rules'

export function evaluateRules(rules: Rules, ctx: Context = {}): Evaluation {
  const ua = new UAParser().getResult()
  const os: 'iOS'|'Android'|'Desktop' =
    ua.os.name === 'iOS' ? 'iOS' : ua.os.name === 'Android' ? 'Android' : 'Desktop'

  const lang = (ctx.lang ?? (typeof navigator !== 'undefined' ? navigator.language : 'en')).slice(0, 2)
  const nowISO = new Date(ctx.now ?? Date.now()).toISOString().slice(0, 10) // YYYY-MM-DD

  const match = rules.routes.find(r => {
    const w = r.when ?? {}
    if (w.os && !w.os.includes(os)) return false
    if (w.lang && !w.lang.includes(lang)) return false
    if (w.dateRange) {
      const [from, to] = w.dateRange
      if (nowISO < from || nowISO > to) return false
    }
    if (w.rollout) {
      const { percentage, seed } = w.rollout
      const id = ctx.userId ?? 'anon'
      const bucket = hashFNV1a(id + seed) % 100
      if (bucket >= percentage) return false
    }
    return true
  })

  return { os, lang, target: (match ?? rules.default), reason: match ? 'rule' : 'default' }
}
