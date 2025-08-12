// 📝 Basic hook test ensuring it calls resolveAndExecute and sets status='done'.
//     - Avoid fake timers here to reduce flakiness.
//     - Assert immediately after awaiting launch().

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@smartqr/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@smartqr/core')>()
  return {
    ...actual,
    resolveAndExecute: vi.fn().mockResolvedValue({
      evaluation: {
        os: 'Desktop',
        nowISO: '2025-08-12T00:00:00.000Z',
        matchedRuleIndex: 0,
        target: { web: 'https://ok.example' },
      },
      used: 'web',
      web: 'https://ok.example',
    }),
  }
})

import { resolveAndExecute } from '@smartqr/core'
import { useSmartQR } from '../hooks/useSmartQR'

describe('useSmartQR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('resolves and sets status to done', async () => {
    const loadRules = vi.fn().mockResolvedValue({
      rules: [{ target: { web: 'https://ok.example' } }],
    })

    const { result } = renderHook(() =>
      useSmartQR({
        id: 'demo',
        loadRules,
      })
    )

    await act(async () => {
      await result.current.launch()
    })

    expect(resolveAndExecute).toHaveBeenCalled()
    expect(result.current.status).toBe('done')
    expect(result.current.result?.used).toBe('web')
  })
})
