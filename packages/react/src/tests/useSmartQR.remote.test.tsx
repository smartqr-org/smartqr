import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'

vi.mock('@smartqr/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@smartqr/core')>()
  return {
    ...actual,
    resolveAndExecute: vi.fn().mockResolvedValue({
      evaluation: {
        os: 'Desktop',
        lang: 'es',
        nowISO: '2025-08-12T00:00:00.000Z',
        matchedRuleIndex: 0,
        reason: 'mock',
        target: { web: 'https://mock.example.com' },
      },
      web: 'https://mock.example.com',
      used: 'web',
    }),
  }
})

import { resolveAndExecute } from '@smartqr/core'
import { useSmartQR } from '../hooks/useSmartQR'

describe('useSmartQR (remote rules)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('goes idle -> loading -> done and stores result', async () => {
    const loadRules = vi.fn().mockResolvedValue({
      rules: [{ target: { web: 'https://mock.example.com' } }],
    })

    const { result } = renderHook(() =>
      useSmartQR({
        id: 'demo',
        loadRules,
        timeoutMs: 1200,
        preferWebOnDesktop: true,
        navigation: 'assign',
        autoLaunch: false,
      }),
    )

    await act(async () => {
      await result.current.launch()
    })

    expect(result.current.status).toBe('done')
    expect(result.current.result?.used).toBe('web')
    expect(result.current.result?.web).toBe('https://mock.example.com')

    expect(resolveAndExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'demo',
        loadRules,
        timeoutMs: 1200,
        preferWebOnDesktop: true,
        navigation: 'assign',
      }),
    )
  })

  it('handles errors by setting status=error and calling onError', async () => {
    const error = new Error('boom')
    const resolveAndExecuteMock = resolveAndExecute as unknown as Mock
    resolveAndExecuteMock.mockRejectedValueOnce(error)

    const loadRules = vi.fn().mockResolvedValue({
      rules: [{ target: { web: 'https://whatever.example' } }],
    })
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useSmartQR({
        id: 'oops',
        loadRules,
        onError,
      }),
    )

    await act(async () => {
      await result.current.launch()
    })

    expect(result.current.status).toBe('error')
    expect(onError).toHaveBeenCalledWith(error)
  })
})
