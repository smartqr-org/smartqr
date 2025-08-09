import { describe, it, expect } from 'vitest'
import { generateQRCode } from '../src/generator'

describe('generateQRCode (SVG)', () => {
  it('returns a valid SVG string with defaults', async () => {
    const svg = await generateQRCode('hello-world-123')
    expect(typeof svg).toBe('string')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.includes('#000000')).toBe(true) // default dark color
  })

  it('respects size and colors', async () => {
    const svg = await generateQRCode('size-and-colors', {
      size: 256,
      margin: 1,
      darkColor: '#111111',
      lightColor: '#F0F0F0',
    })
    expect(svg.includes('#111111')).toBe(true)
    expect(svg.includes('#F0F0F0')).toBe(true)
    expect(svg.includes('256')).toBe(true)
  })

  it('can produce transparent light modules', async () => {
    const svg = await generateQRCode('transparent-light', {
      lightColor: '#EFEFEF',      // pass a valid hex; we will replace it to "none"
      transparentLight: true,
    })
    // Should not contain the light hex anymore
    expect(svg.toLowerCase().includes('#efefef')).toBe(false)
    // Should contain fill="none" for the light background/areas
    expect(svg.toLowerCase().includes('fill="none"')).toBe(true)
  })

  it('snapshot is stable with a fixed version', async () => {
    const svg = await generateQRCode('snapshot-stability', {
      version: 4,
      margin: 1,
      level: 'M',
    })
    expect(svg).toMatchSnapshot()
  })
})
