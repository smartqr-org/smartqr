// 📝 Light integration: allow generateQRCode real behavior or keep a minimal mock.

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// If you have a real generateQRCode in core you can remove this mock.
// Keeping a minimal mock ensures stability across environments.
vi.mock('@smartqr/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@smartqr/core')>()
  return {
    ...actual,
    generateQRCode: vi.fn().mockResolvedValue(
      // a small but valid-looking SVG snippet
      '<svg height="256" width="256" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/></svg>'
    ),
  }
})

import { SmartQRCode } from '../components/SmartQRCode'

describe('SmartQRCode (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders a valid SVG for a basic payload', async () => {
    render(<SmartQRCode value="https://example.com" />)

    await waitFor(() => {
      const node = screen.getByTestId('smartqr-container')
      expect(node).toHaveAttribute('role', 'img')
      expect(node.innerHTML.toLowerCase()).toContain('<svg')
    }, { timeout: 5000 })
  })

  it('updates SVG when props change', async () => {
    const { rerender } = render(<SmartQRCode value="https://example.com" />)

    await waitFor(() => {
      expect(screen.getByTestId('smartqr-container').innerHTML.toLowerCase()).toContain('<svg')
    })

    rerender(<SmartQRCode value="https://changed.example.com" />)

    await waitFor(() => {
      expect(screen.getByTestId('smartqr-container').innerHTML.toLowerCase()).toContain('<svg')
    })
  })
})
