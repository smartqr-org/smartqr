export type SmartQRActionType = 'deeplink' | 'web'

export interface SmartQRAction {
  type: SmartQRActionType
  url: string
}

export function decideAction(opts: { deeplink?: string; web?: string }): SmartQRAction | null {
  const { deeplink, web } = opts
  if (deeplink && deeplink.trim()) return { type: 'deeplink', url: deeplink }
  if (web && web.trim()) return { type: 'web', url: web }
  return null
}
