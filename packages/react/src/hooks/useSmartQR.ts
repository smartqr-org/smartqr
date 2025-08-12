// 📝 React binding that integrates the core resolver with a simple API.
//     - It relies only on resolveAndExecute from @smartqr/core.
//     - No references to decideAction/SmartQRAction (not exported by core).
//     - Supports remote rules via loadRules + id passthrough.
//     - Keeps a minimal state machine for UI purposes.

import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveAndExecute, type ResolveOptions, type ResolveResult } from '@smartqr/core'

export type SmartQRStatus = 'idle' | 'loading' | 'done' | 'error'

export interface UseSmartQROptions {
  /** Identifier passed to loadRules(id); if omitted, core resolver infers it from location (?id=...) */
  id?: string
  /** Function that returns the rules payload for the provided id */
  loadRules?: ResolveOptions['loadRules']
  /** Optional timeout for deeplink fallback (ms) */
  timeoutMs?: number
  /** Prefer web navigation over deeplink on desktop (delegated to core) */
  preferWebOnDesktop?: boolean
  /** Navigation method for the core (assign | replace) */
  navigation?: ResolveOptions['navigation']
  /** Auto trigger resolution on mount */
  autoLaunch?: boolean
  /** Lifecycle hooks for analytics/logging */
  onBefore?: ResolveOptions['onBefore']
  onAfter?: ResolveOptions['onAfter']
  /** Error callback */
  onError?: (error: unknown) => void
}

export interface UseSmartQRReturn {
  status: SmartQRStatus
  result: ResolveResult | null
  launch: () => Promise<void>
}

export function useSmartQR(options: UseSmartQROptions = {}): UseSmartQRReturn {
  const {
    id,
    loadRules,
    timeoutMs,
    preferWebOnDesktop,
    navigation,
    autoLaunch = false,
    onBefore,
    onAfter,
    onError,
  } = options

  const [status, setStatus] = useState<SmartQRStatus>('idle')
  const [result, setResult] = useState<ResolveResult | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 🧠 Launches the core resolver; safe to call multiple times
  const launch = useCallback(async () => {
    if (!loadRules) {
      // If no loader is provided, do nothing but keep API stable
      return
    }

    setStatus('loading')
    try {
      const res = await resolveAndExecute({
        id,
        loadRules,
        timeoutMs,
        preferWebOnDesktop,
        navigation,
        onBefore,
        onAfter,
      })
      if (!mountedRef.current) return
      setResult(res)
      setStatus('done')
    } catch (err) {
      if (!mountedRef.current) return
      setStatus('error')
      onError?.(err)
    }
  }, [id, loadRules, timeoutMs, preferWebOnDesktop, navigation, onBefore, onAfter, onError])

  useEffect(() => {
    if (autoLaunch) {
      // Fire and forget; errors are captured in state/onError
      void launch()
    }
  }, [autoLaunch, launch])

  return { status, result, launch }
}
