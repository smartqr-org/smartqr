import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveAndExecute, decideAction, type SmartQRAction } from '@smartqr/core'

export type SmartQRStatus = 'idle' | 'resolving' | 'done' | 'error'

export interface UseSmartQROptions {
  /** Called with the result of resolveAndExecute or the chosen action */
  onResolved?: (result: unknown) => void
  /** Called with the error or failed result */
  onError?: (error: unknown) => void
  /** Optional timeout (ms) for cutting resolution if it hangs */
  timeoutMs?: number

  /** Basic deeplink/web MVP options */
  deeplink?: string
  web?: string
  /** Timeout for web fallback after deeplink attempt */
  fallbackMs?: number
  /** Auto launch deeplink/web on mount */
  autoLaunch?: boolean
}

export interface UseSmartQRReturn {
  status: SmartQRStatus
  /** Triggers the core rules resolver (future remote payloads) */
  resolve: () => Promise<void>
  /** Triggers the simple deeplink/web flow (MVP) */
  launch: () => void
  /** Last chosen action for MVP */
  lastAction: SmartQRAction | null
}

export function useSmartQR(options: UseSmartQROptions = {}): UseSmartQRReturn {
  const {
    onResolved,
    onError,
    timeoutMs = 2000,

    deeplink,
    web,
    fallbackMs = 1200,
    autoLaunch = false,
  } = options

  const [status, setStatus] = useState<SmartQRStatus>('idle')
  const mounted = useRef(true)

  const timerRef = useRef<number | null>(null)
  const launchedRef = useRef(false)
  const [lastAction, setLastAction] = useState<SmartQRAction | null>(null)

  useEffect(() => {
    return () => {
      mounted.current = false
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const resolve = useCallback(async () => {
    setStatus('resolving')
    try {
      const result = await resolveAndExecute({ loadRules: async () => ({}), timeoutMs })

      if (!mounted.current) return
      // We don't know shape of result here; pass through.
      setStatus('done')
      onResolved?.(result)
    } catch (err) {
      if (!mounted.current) return
      setStatus('error')
      onError?.(err)
    }
  }, [onResolved, onError, timeoutMs])

  const openUrl = (url: string) => window.location.assign(url)

  const launch = useCallback(() => {
    if (launchedRef.current) return
    launchedRef.current = true

    const chosen = decideAction({ deeplink, web })
    setLastAction(chosen)

    if (!chosen) return

    if (chosen.type === 'deeplink') {
      openUrl(chosen.url)
      if (web) {
        timerRef.current = window.setTimeout(() => {
          openUrl(web)
        }, Math.max(0, fallbackMs))
      }
    } else {
      openUrl(chosen.url)
    }

    onResolved?.(chosen)
  }, [deeplink, web, fallbackMs, onResolved])

  useEffect(() => {
    if (autoLaunch) launch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLaunch])

  return { status, resolve, launch, lastAction }
}
