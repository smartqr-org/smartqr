import { describe, it, expect } from 'vitest'
import { evaluateRules } from '../evaluate'
import { type Rules } from '../rules'

describe('evaluateRules', () => {
  it('matches first rule by OS and returns its target', () => {
    const rules: Rules = {
      rules: [
        {
          if: { os: ['iOS'] },
          target: { ios: 'myapp://home', web: 'https://ios.example.com' },
          reason: 'iOS users'
        },
        {
          if: { os: ['Android'] },
          target: { android: 'myapp://android', web: 'https://android.example.com' }
        }
      ],
      default: { target: { web: 'https://default.example.com' } }
    }

    const evalResult = evaluateRules(rules, { os: 'iOS', lang: 'es', rolloutSeed: 0 })
    expect(evalResult.target.ios).toBe('myapp://home')
    expect(evalResult.matchedRuleIndex).toBe(0)
    expect(evalResult.reason).toBe('iOS users')
  })

  it('falls back to default when no rule matches', () => {
    const rules: Rules = {
      rules: [
        {
          if: { os: ['Android'] },
          target: { android: 'myapp://android', web: 'https://android.example.com' }
        }
      ],
      default: { target: { web: 'https://default.example.com' }, reason: 'Default route' }
    }

    const evalResult = evaluateRules(rules, { os: 'iOS', lang: 'es' })
    expect(evalResult.matchedRuleIndex).toBe(-1)
    expect(evalResult.target.web).toBe('https://default.example.com')
    expect(evalResult.reason).toBe('Default route')
  })

  it('respects rollout percentage using rolloutSeed', () => {
    const rules: Rules = {
      rules: [
        {
          if: { rollout: 10 }, // match only when seed ∈ [0..10]
          target: { web: 'https://bucket-a.example.com' }
        },
        {
          target: { web: 'https://bucket-b.example.com' }
        }
      ]
    }

    const a = evaluateRules(rules, { os: 'Desktop', rolloutSeed: 5 })
    expect(a.target.web).toBe('https://bucket-a.example.com')

    const b = evaluateRules(rules, { os: 'Desktop', rolloutSeed: 50 })
    expect(b.target.web).toBe('https://bucket-b.example.com')
  })
})
