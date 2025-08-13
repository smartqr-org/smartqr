import { describe, it, expect, vi } from 'vitest'
import { resolveAndExecute } from '../resolve'
import { RulesSchema } from '../rules'

describe('resolveAndExecute', () => {
  const baseRules = RulesSchema.parse({
    rules: [{ target: { web: 'https://example.com' } }],
    default: { target: { web: 'https://example.com' } },
  })

  it('prefers web on Desktop when preferWebOnDesktop is true', async () => {
    const navigate = vi.fn()
    await resolveAndExecute({
      loadRules: async () => baseRules,
      context: { os: 'Desktop' },
      navigate,
    })
    expect(navigate).toHaveBeenCalledWith('https://example.com', 'assign')
  })

  it('tries deeplink path and falls back to web after timeout', async () => {
    vi.useFakeTimers()
    const navigate = vi.fn()

    const rules = RulesSchema.parse({
      rules: [
        {
          target: { deeplink: 'myapp://home', ios: 'myapp://home', web: 'https://example.com' },
        },
      ],
      default: { target: { web: 'https://example.com' } },
    })

    const promise = resolveAndExecute({
      loadRules: async () => rules,
      context: { os: 'iOS' }, // móvil para no preferir web
      timeoutMs: 500,
      navigate,
    })

    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)

    await vi.advanceTimersByTimeAsync(500)
    await promise
    expect(navigate).toHaveBeenCalledWith('https://example.com', 'assign')

    vi.useRealTimers()
  })

  it('uses fallback directly when no deeplink is present', async () => {
    const navigate = vi.fn()
    const rules = RulesSchema.parse({
      rules: [{ target: { fallback: 'https://fallback.example.com' } }],
      default: { target: { web: 'https://example.com' } },
    })
    await resolveAndExecute({
      loadRules: async () => rules,
      context: { os: 'Android' },
      navigate,
    })
    expect(navigate).toHaveBeenCalledWith('https://fallback.example.com', 'assign')
  })
})
