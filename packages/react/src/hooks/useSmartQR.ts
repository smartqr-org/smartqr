import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveAndExecute } from '@smartqr/core'

export type SmartQRStatus = 'idle' | 'resolving' | 'done' | 'error'

export interface UseSmartQROptions {
  /** Se llamará con el resultado de resolveAndExecute cuando todo vaya bien */
  onResolved?: (result: unknown) => void
  /** Se llamará con el error o resultado fallido */
  onError?: (error: unknown) => void
  /** Timeout opcional (ms) para cortar la resolución si se cuelga */
  timeoutMs?: number
}

export interface UseSmartQRReturn {
  status: SmartQRStatus
  /** Dispara la resolución; el payload es opcional */
  resolve: (payload?: unknown) => Promise<void>
}

/** Helper interno: aplica timeout a una promesa si se especifica */
function withTimeout<T>(p: Promise<T>, ms?: number): Promise<T> {
  if (!ms || ms <= 0) return p
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    p.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) }
    )
  })
}

/**
 * Hook fino que envuelve resolveAndExecute.
 * - Expone `status` con transición: idle -> resolving -> done|error
 * - Llama a `onResolved` cuando status === 'done'
 * - Llama a `onError` ante fallo o timeout
 */
export function useSmartQR(options: UseSmartQROptions = {}): UseSmartQRReturn {
  const { onResolved, onError, timeoutMs } = options
  const [status, setStatus] = useState<SmartQRStatus>('idle')
  const mounted = useRef(true)

  useEffect(() => {
    return () => { mounted.current = false }
  }, [])

  const resolve = useCallback(async (payload?: unknown) => {
    setStatus('resolving')
    try {
      // resolveAndExecute puede devolver { status: 'done' | 'error', ... }
      const result: any = await withTimeout(
        Promise.resolve(resolveAndExecute(payload as any)),
        timeoutMs
      )

      if (!mounted.current) return

      if (result && result.status === 'done') {
        setStatus('done')
        onResolved?.(result)
      } else {
        setStatus('error')
        onError?.(result)
      }
    } catch (err) {
      if (!mounted.current) return
      setStatus('error')
      onError?.(err)
    }
  }, [onResolved, onError, timeoutMs])

  return { status, resolve }
}
