import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const resolveAndExecuteMock = vi.fn().mockResolvedValue({ status: 'done' })

vi.mock('@smartqr/core', () => ({
  resolveAndExecute: resolveAndExecuteMock
}))

describe('useSmartQR', () => {
  beforeEach(() => {
    resolveAndExecuteMock.mockClear()
    vi.resetModules()
  })

  it('resolves and sets status to done', async () => {
    const { useSmartQR } = await import('../hooks/useSmartQR')

    const { result } = renderHook(() => useSmartQR({}))

    await act(async () => {
      await result.current.resolve?.()
    })

    await waitFor(() => {
      expect(resolveAndExecuteMock).toHaveBeenCalled()
      expect(result.current.status).toBe('done')
    }, { timeout: 3000 })
  })
})
