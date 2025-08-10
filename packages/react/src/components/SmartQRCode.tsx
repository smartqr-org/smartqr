import React from 'react'
import { generateQRCode, type GenerateQROptions } from '@smartqr/core'
import { useSmartQR, UseSmartQROptions } from '../hooks/useSmartQR'

export interface SmartQRCodeProps extends UseSmartQROptions, Partial<GenerateQROptions> {
  value: string
  rulesUrl?: string
  onClickResolve?: boolean
  onResolved?: (result: unknown) => void
}

export function SmartQRCode(props: SmartQRCodeProps) {
  const {
    value,
    size = 128,
    margin = 1,
    level = 'M',
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    version,
    transparentLight = false,
    rulesUrl,
    onClickResolve = false,
    onResolved,
    ...hookOptions
  } = props

  const { run, status, result } = useSmartQR({
    ...hookOptions,
    loadRules: rulesUrl
      ? async () => {
        const res = await fetch(rulesUrl)
        return res.json()
      }
      : hookOptions.loadRules,
  })

  React.useEffect(() => {
    if (status === 'done' && onResolved) {
      onResolved(result)
    }
  }, [status, result, onResolved])

  const opts: GenerateQROptions = {
    size,
    margin,
    level,
    darkColor,
    lightColor,
    version,
    transparentLight,
  }

  const svg = generateQRCode(value, opts)

  const handleClick = () => {
    if (onClickResolve) run()
  }

  return (
    <div
      onClick={onClickResolve ? handleClick : undefined}
      dangerouslySetInnerHTML={{ __html: svg as unknown as string }}
    />
  )
}
