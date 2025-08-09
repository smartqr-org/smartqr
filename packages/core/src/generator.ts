import QRCode from 'qrcode'
import { z } from 'zod'

export const GenerateQROptionsSchema = z.object({
  size: z.number().int().min(16).max(4096).default(128),
  margin: z.number().int().min(0).max(8).default(2),
  level: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  darkColor: z.string().default('#000000'),
  lightColor: z.string().default('#FFFFFF'),
  version: z.number().int().min(1).max(40).optional(),
  transparentLight: z.boolean().default(false),
})

export type GenerateQROptions = z.input<typeof GenerateQROptionsSchema>

// Replace all occurrences of a given fill color with "none"
function makeLightTransparent(svg: string, lightHex: string) {
  // Normalize hex case for comparison in the SVG output
  const hex = lightHex.toLowerCase()
  // Replace fill="#hex" (hex may appear upper/lower in output)
  const rx = new RegExp(`fill=["']#?${hex.replace('#', '')}["']`, 'gi')
  return svg.replace(rx, 'fill="none"')
}

/**
 * Generate a QR Code as an SVG string.
 */
export async function generateQRCode(
  value: string,
  options?: GenerateQROptions
): Promise<string> {
  if (!value || typeof value !== 'string') {
    throw new Error('`value` must be a non-empty string')
  }

  const opts = GenerateQROptionsSchema.parse(options ?? {})
  // Always pass a valid hex to the renderer; make transparent afterwards if needed
  const lightHex = opts.lightColor

  const svgRaw = await QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: opts.level,
    margin: opts.margin,
    width: opts.size,
    version: opts.version,
    color: { dark: opts.darkColor, light: lightHex },
  })

  const svg = opts.transparentLight ? makeLightTransparent(svgRaw, lightHex) : svgRaw
  return svg.trim()
}
