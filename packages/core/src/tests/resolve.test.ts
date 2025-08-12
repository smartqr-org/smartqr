// 📝 Integration-like tests for resolveAndExecute using injected dependencies.
//     - We never touch window.location here.
//     - We inject loadRules + navigate to observe behavior deterministically.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveAndExecute, BACKSTOP_TIMEOUT_MS } from '../resolve'

describe('resolveAndExecute', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('prefers web on Desktop when preferWebOnDesktop is true', async () => {
    const navigate = vi.fn()
    const loadRules = vi.fn().mockResolvedValue({
      rules: [{ target: { web: 'https://desktop.example.com', ios: 'myapp://ios' } }]
    })

    const res = await resolveAndExecute({
      loadRules,
      context: { os: 'Desktop' },
      preferWebOnDesktop: true,
      navigation: 'assign',
      navigate
    })

    expect(res.used).toBe('web')
    expect(navigate).toHaveBeenCalledWith('https://desktop.example.com', 'assign')
  })

  it('tries deeplink then falls back to web after timeout', async () => {
    const navigate = vi.fn()
    const loadRules = vi.fn().mockResolvedValue({
      rules: [{
        if: { os: ['iOS'] },
        target: {
          ios: 'myapp://home',
          web: 'https://fallback.example.com'
        }
      }]
    })

    // Kick it off
    const promise = resolveAndExecute({
      loadRules,
      context: { os: 'iOS' },
      timeoutMs: 700,
      navigate
    })

    // Immediately after call, deeplink should be attempted
    expect(navigate).toHaveBeenCalledWith('myapp://home', 'assign')
    expect(navigate).toHaveBeenCalledTimes(1)

    // Advance just before timeout, no fallback yet
    vi.advanceTimersByTime(699)
    expect(navigate).toHaveBeenCalledTimes(1)

    // Advance to trigger fallback + backstop settle
    vi.advanceTimersByTime(1 + BACKSTOP_TIMEOUT_MS)

    const res = await promise
    // Fallback should have been called
    expect(navigate).toHaveBeenCalledWith('https://fallback.example.com', 'assign')
    expect(res.used).toBe('fallback')
  })

  it('uses fallback directly when no deeplink is present', async () => {
    const navigate = vi.fn()
    const loadRules = vi.fn().mockResolvedValue({
      rules: [{ target: { fallback: 'https://fallback.only' } }]
    })

    const res = await resolveAndExecute({
      loadRules,
      context: { os: 'Android' },
      navigate
    })

    expect(navigate).toHaveBeenCalledWith('https://fallback.only', 'assign')
    expect(res.used).toBe('fallback')
  })
})
