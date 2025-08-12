import { describe, it, expect } from 'vitest'
import { RulesSchema } from '../rules'
import { evaluateRules } from '../evaluate'

const base = {
  version: 1,
  default: { web: 'https://example.com', fallback: 'https://example.com/install' },
  routes: []
}

describe('evaluateRules', () => {
  it('matches by OS (Desktop)', () => {
    const rules = RulesSchema.parse({
      ...base,
      routes: [{ when: { os: ['Desktop'] }, web: 'https://desktop.example.com' }]
    })
    const res = evaluateRules(rules, { lang: 'en' })
    expect(res.target.web).toBe('https://desktop.example.com')
    expect(res.reason).toBe('rule')
  })

  it('matches by language (es)', () => {
    const rules = RulesSchema.parse({
      ...base,
      routes: [{ when: { lang: ['es'] }, web: 'https://example.com/es' }]
    })
    const res = evaluateRules(rules, { lang: 'es' })
    expect(res.target.web).toBe('https://example.com/es')
  })

  it('filters by dateRange (inside range)', () => {
    const rules = RulesSchema.parse({
      ...base,
      routes: [{ when: { dateRange: ['2025-01-01','2025-12-31'] }, web: 'https://example.com/2025' }]
    })
    const res = evaluateRules(rules, { lang: 'en', now: Date.parse('2025-08-09') })
    expect(res.target.web).toBe('https://example.com/2025')
  })

  it('deterministic rollout bucket', () => {
    const rules = RulesSchema.parse({
      ...base,
      routes: [{ when: { rollout: { percentage: 50, seed: 'promo123' } }, web: 'https://example.com/B' }]
    })
    const a = evaluateRules(rules, { userId: 'userA' })
    const b = evaluateRules(rules, { userId: 'userA' })
    expect(a.target.web).toBe(b.target.web)
  })
})
