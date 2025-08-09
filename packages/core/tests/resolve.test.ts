import { describe, it, expect, vi } from 'vitest'
import { Evaluation, resolveAndExecute } from '../src'
import * as evalMod from '../src/evaluate'

describe('resolveAndExecute', () => {
  it('falls back on mobile when deeplink is not handled (timeout fires)', async () => {
    vi.useFakeTimers()

    // Raw rules object — no pre-parsing with Zod
    const rulesRaw = {
      version: 1,
      default: {
        web: 'https://example.com',
        fallback: 'https://example.com/install'
      },
      routes: [
        {
          android: 'myapp://open'
          // "when" omitted on purpose — allowed if schema has it optional
        }
      ]
    }

    // Mock evaluateRules to simulate an Android match
    vi.spyOn(evalMod, 'evaluateRules').mockReturnValue({
      os: 'Android',
      lang: 'en',
      target: {
        android: 'myapp://open',
        web: 'https://example.com',
        fallback: 'https://example.com/install'
      },
      reason: 'rule'
    } as Evaluation)

    const navigations: Array<{ url: string; kind: 'assign' | 'replace' }> = []
    const navigate = (url: string, kind: 'assign' | 'replace') =>
      navigations.push({ url, kind })

    const p = resolveAndExecute({
      id: 'any',
      loadRules: async () => rulesRaw,
      timeoutMs: 1,
      preferWebOnDesktop: false,
      navigate
    })

    // Simulate all timers firing
    await vi.runAllTimersAsync()
    // Let pending microtasks resolve
    await Promise.resolve()

    const res = await p

    expect(navigations[0]?.url).toBe('myapp://open')
    expect(navigations.at(-1)?.url).toMatch(/example\.com/)
    expect(res.used === 'fallback' || res.used === 'web').toBeTruthy()

    vi.useRealTimers()
  })

  it('goes straight to web on Desktop when preferWebOnDesktop=true', async () => {
    const rulesRaw = {
      version: 1,
      default: {
        web: 'https://example.com',
        fallback: 'https://example.com/install'
      },
      routes: [
        {
          web: 'https://example.com/desktop'
        }
      ]
    }

    // Mock evaluateRules to simulate Desktop match
    vi.spyOn(evalMod, 'evaluateRules').mockReturnValue({
      os: 'Desktop',
      lang: 'en',
      target: {
        web: 'https://example.com/desktop'
      },
      reason: 'rule'
    } as Evaluation)

    const navigations: Array<{ url: string; kind: 'assign' | 'replace' }> = []
    const navigate = (url: string, kind: 'assign' | 'replace') =>
      navigations.push({ url, kind })

    const res = await resolveAndExecute({
      id: 'any',
      loadRules: async () => rulesRaw,
      preferWebOnDesktop: true,
      navigate
    })

    expect(navigations.length).toBe(1)
    expect(navigations[0]?.url).toBe('https://example.com/desktop')
    expect(res.used).toBe('web')
  })
})
