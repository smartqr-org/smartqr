import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveAndExecute } from '@smartqr/core'

export type SmartQRStatus = 'idle' | 'running' | 'done' | 'error'

export interface UseSmartQROptions {
  id?: string
  loadRules?: () => Promise<unknown> | unknown
  preferWebOnDesktop?: boolean
  timeoutMs?: number
  auto?: boolean
  navigate?: (url: string) => void
}

export interface UseSmartQRState<T = unknown> {
  status: SmartQRStatus
  result?: T
  error?: unknown
}

export interface UseSmartQRReturn<T = unknown> extends UseSmartQRState<T> {
  run: () => Promise<void>
  reset: () => void
}

export function useSmartQR<T = unknown>(options: UseSmartQROptions = {}): UseSmartQRReturn<T> {
  const {
    loadRules,
    preferWebOnDesktop,
    timeoutMs,
    auto = false,
    navigate,
  } = options

  const isMounted = useRef(true)
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const [state, setState] = useState<UseSmartQRState<T>>({ status: 'idle' })

  const safeSet = useCallback((next: UseSmartQRState<T>) => {
    if (!isMounted.current) return
    setState(next)
  }, [])

  const run = useCallback(async () => {
    safeSet({ status: 'running', error: undefined })
    try {
      const res = await resolveAndExecute({
        loadRules,
        preferWebOnDesktop,
        timeoutMs,
        navigate,
      } as any)
      safeSet({ status: 'done', result: res as T })
    } catch (e) {
      safeSet({ status: 'error', error: e })
    }
  }, [loadRules, preferWebOnDesktop, timeoutMs, navigate])

  useEffect(() => {
    if (auto) void run()
  }, [auto, run])

  const reset = useCallback(() => safeSet({ status: 'idle' }), [safeSet])

  return { ...state, run, reset }
}
