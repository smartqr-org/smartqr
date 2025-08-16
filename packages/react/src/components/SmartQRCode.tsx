import React, { useEffect, useRef } from 'react'
import { generateQRCode, resolveAndExecute } from '@smartqr/core'
import type { ResolveOptions } from '@smartqr/core'

/* ===================== types ===================== */

export type SmartQRCodeOptions = {
  size?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  darkColor?: string
  lightColor?: string
  transparentLight?: boolean
  version?: number
}

export interface SmartQRCodeProps {
  /** String value to encode in the QR */
  value: string
  /** Visual options for the QR rendering */
  options?: SmartQRCodeOptions
  /** Resolution options for SmartQR routing */
  resolveOptions?: ResolveOptions
  /** Callback fired when resolveAndExecute succeeds */
  onResolved?: (info: Awaited<ReturnType<typeof resolveAndExecute>>) => void
  /** Accessible label override */
  'aria-label'?: string
}

/* ===================== helpers ===================== */

const isError = (e: unknown): e is Error => e instanceof Error

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const hasSvg = (v: unknown): v is { svg: string } =>
  isObject(v) && typeof (v as { svg?: unknown }).svg === 'string'

function mapOptions(opts?: SmartQRCodeOptions): Record<string, unknown> | undefined {
  if (!opts) return undefined
  const out: Record<string, unknown> = {}

  if (opts.size !== undefined) out.size = opts.size
  if (opts.margin !== undefined) out.margin = opts.margin
  if (opts.errorCorrectionLevel !== undefined) out.level = opts.errorCorrectionLevel
  if (opts.lightColor !== undefined) out.lightColor = opts.lightColor
  if (opts.transparentLight !== undefined) out.transparentLight = opts.transparentLight
  if (opts.version !== undefined) out.version = opts.version
  if (opts.darkColor !== undefined) out.darkColor = opts.darkColor

  return Object.keys(out).length ? out : undefined
}

function extractSvg(out: unknown): string {
  if (typeof out === 'string') return out
  if (hasSvg(out)) return out.svg
  return String(out ?? '')
}

/* ===================== component ===================== */

export const SmartQRCode: React.FC<SmartQRCodeProps> = ({
                                                          value,
                                                          options,
                                                          resolveOptions,
                                                          onResolved,
                                                          ...rest
                                                        }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const doRender = async () => {
      const mapped = mapOptions(options)

      try {
        const out = await generateQRCode(value, mapped)
        const svg = extractSvg(out)
        if (containerRef.current && svg) {
          containerRef.current.innerHTML = svg
        }
      } catch (e) {
        console.warn('[SmartQR] generateQRCode failed:', e)
      }
    }

    void doRender()
  }, [value, options])

  const handleClick = async () => {
    if (!resolveOptions) return
    try {
      const info = await resolveAndExecute(resolveOptions)
      onResolved?.(info)
    } catch (e: unknown) {
      if (isError(e)) console.warn('[SmartQR] resolveAndExecute failed:', e.message)
      else console.warn('[SmartQR] resolveAndExecute failed:', e)
    }
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={rest['aria-label'] ?? `QR code representing: ${value}`}
      data-testid="smartqr-container"
      onClick={handleClick}
    />
  )
}
