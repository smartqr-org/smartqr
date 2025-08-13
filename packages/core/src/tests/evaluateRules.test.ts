import { describe, it, expect } from 'vitest'
import { RulesSchema } from '../rules'
import { evaluateRules } from '../evaluate'

describe('evaluateRules', () => {
  const baseDefault = { target: { web: 'https://default.example.com' } }

  it('matches by OS (Desktop)', () => {
    const rules = RulesSchema.parse({
      rules: [
        {
          if: { os: ['Desktop'] },
          target: { web: 'https://desktop.example.com' },
          reason: 'rule',
        },
      ],
      default: baseDefault,
    })
    const res = evaluateRules(rules, { os: 'Desktop', lang: 'en' })
    expect(res.target.web).toBe('https://desktop.example.com')
    expect(res.reason).toBe('rule')
  })

  it('matches by language (es)', () => {
    const rules = RulesSchema.parse({
      rules: [
        {
          if: { lang: ['es'] },
          target: { web: 'https://example.com/es' },
          reason: 'rule',
        },
      ],
      default: baseDefault,
    })
    const res = evaluateRules(rules, { os: 'Desktop', lang: 'es' })
    expect(res.target.web).toBe('https://example.com/es')
    expect(res.reason).toBe('rule')
  })

  it('filters by dateRange (inside range)', () => {
    const rules = RulesSchema.parse({
      rules: [
        {
          if: {
            dateRange: {
              start: '2025-01-01T00:00:00Z',
              end: '2025-12-31T23:59:59Z',
            },
          },
          target: { web: 'https://example.com/2025' },
        },
      ],
      default: baseDefault,
    })
    const res = evaluateRules(rules, {
      os: 'Desktop',
      lang: 'en',
      now: new Date('2025-06-01T12:00:00Z'),
    })
    expect(res.target.web).toBe('https://example.com/2025')
  })

  it('rollout numeric threshold respects provided rolloutSeed', () => {
    const rules = RulesSchema.parse({
      rules: [
        {
          if: { rollout: 50 },
          target: { web: 'https://example.com/B' },
        },
      ],
      default: baseDefault,
    })
    const res1 = evaluateRules(rules, { os: 'Desktop', lang: 'en', rolloutSeed: 10 })
    const res2 = evaluateRules(rules, { os: 'Desktop', lang: 'en', rolloutSeed: 10 })
    expect(res1.target.web).toBe('https://example.com/B')
    expect(res2.target.web).toBe('https://example.com/B')
  })
})
