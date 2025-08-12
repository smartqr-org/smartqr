import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import React from 'react'
import { SmartQRCode } from '../components/SmartQRCode'

beforeEach(() => cleanup())

describe('SmartQRCode (integration)', () => {
  it('renders a valid SVG for a basic payload', async () => {
    render(
      <SmartQRCode
        value="https://example.com"
        size={256}
        margin={2}
        level="M"
        darkColor="#000000"
        lightColor="#ffffff"
        transparentLight={false}
        ariaLabel="QR code representing: https://example.com"
      />
    )

    await waitFor(() => {
      const node = screen.getByTestId('smartqr-container')
      expect(node).toHaveAttribute('role', 'img')
      expect(node.innerHTML.toLowerCase()).toContain('<svg')
    }, { timeout: 5000 })
  })

  it('updates SVG when props change', async () => {
    const { rerender } = render(
      <SmartQRCode
        value="smartqr://deep-link/demo"
        size={180}
        margin={1}
        level="L"
        darkColor="#111111"
        lightColor="#ffffff"
        transparentLight={false}
        ariaLabel="Smart QR"
      />
    )

    const firstMarkup = await waitFor(() => {
      const n = screen.getByTestId('smartqr-container')
      if (!n.innerHTML) throw new Error('not ready')
      return n.innerHTML
    }, { timeout: 5000 })

    rerender(
      <SmartQRCode
        value="smartqr://deep-link/demo"
        size={180}
        margin={1}
        level="H"
        darkColor="#222222"
        lightColor="#ffffff"
        transparentLight={false}
        ariaLabel="Smart QR"
      />
    )

    await waitFor(() => {
      const newMarkup = screen.getByTestId('smartqr-container').innerHTML
      expect(newMarkup).not.toEqual(firstMarkup)
    }, { timeout: 5000 })
  })
})
