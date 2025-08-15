import React, { useEffect, useRef } from 'react'
import { generateQRCode, resolveAndExecute } from '@smartqr/core'
import type { ResolveOptions } from '@smartqr/core'

export type SmartQRCodeOptions = {
  size?: number
  margin?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  color?: string
  darkColor?: string
  lightColor?: string
  transparentLight?: boolean
  version?: number
}

export interface SmartQRCodeProps {
  value: string
  options?: SmartQRCodeOptions
  resolveOptions?: ResolveOptions
  onResolved?: (info: Awaited<ReturnType<typeof resolveAndExecute>>) => void
}

/* ===================== helpers ===================== */

const isError = (e: unknown): e is Error => e instanceof Error

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const hasSvg = (v: unknown): v is { svg: string } =>
  isObject(v) && typeof (v as { svg?: unknown }).svg === 'string'

function mapOptions(opts?: SmartQRCodeOptions): Readonly<Record<string, unknown>> | undefined {
  if (!opts) return undefined
  const out: Record<string, unknown> = {}

  if (opts.size !== undefined) out.size = opts.size
  if (opts.margin !== undefined) out.margin = opts.margin
  if (opts.level !== undefined) out.level = opts.level
  if (opts.lightColor !== undefined) out.lightColor = opts.lightColor
  if (opts.transparentLight !== undefined) out.transparentLight = opts.transparentLight
  if (opts.version !== undefined) out.version = opts.version
  if (opts.darkColor !== undefined) out.darkColor = opts.darkColor
  else if (opts.color !== undefined) out.darkColor = opts.color

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
                                                        }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderSeq = useRef(0)

  useEffect(() => {
    let active = true

    const doRender = async () => {
      const mapped = mapOptions(options)

      try {
        const genTuple = generateQRCode as (v: string, o?: unknown) => Promise<unknown>
        let out = await genTuple(value, mapped)
        let svg = extractSvg(out)

        if (!svg || !svg.includes('<svg')) {
          const genObj = generateQRCode as (o: unknown) => Promise<unknown>
          out = await genObj(mapped ? { value, ...mapped } : { value })
          svg = extractSvg(out)
        }

        if (containerRef.current && svg) containerRef.current.innerHTML = svg

      } catch (e: unknown) {
        try {
          const genObj = generateQRCode as (o: unknown) => Promise<unknown>
          const out = await genObj(mapped ? { value, ...mapped } : { value })
          const svg = extractSvg(out)
          if (containerRef.current && svg) containerRef.current.innerHTML = svg
        } catch (e2) {
          if (e2 instanceof Error) console.warn('[SmartQR] generateQRCode failed:', e2.message)
          else console.warn('[SmartQR] generateQRCode failed:', e2)
        }
      }
    }

    void doRender()
    return () => {
      active = false
    }
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
      aria-label={`QR code representing: ${value}`}
      data-testid="smartqr-container"
      onClick={handleClick}
    />
  )
}
