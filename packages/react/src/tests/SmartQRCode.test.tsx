import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { SmartQRCode } from '../components/SmartQRCode'
import * as core from '@smartqr/core'

beforeEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('<SmartQRCode />', () => {
  it('renders a QR and calls core.generateQRCode with the correct args (value, options)', async () => {
    const spy = vi.spyOn(core, 'generateQRCode').mockResolvedValue('<svg data-prop="ok"></svg>')

    render(
      <SmartQRCode
        value="https://example.com"
        size={256}
        transparentLight
        level="H"
        ariaLabel="QR"
      />
    )

    await waitFor(() => {
      const container = screen.getByTestId('smartqr-container')
      expect(container).toHaveAttribute('role', 'img')
      expect(container.innerHTML).toContain('<svg')
    })

    await waitFor(() => {
      const lastCall = spy.mock.calls.at(-1)
      expect(lastCall?.[0]).toBe('https://example.com')
      expect(lastCall?.[1]).toEqual(
        expect.objectContaining({
          size: 256,
          transparentLight: true,
          level: 'H',
        })
      )
    }, { timeout: 3000 })
  })

  it('invokes onResolved after click when core.resolveAndExecute resolves', async () => {
    const onResolved = vi.fn()
    vi.spyOn(core, 'resolveAndExecute').mockResolvedValue({ status: 'done' } as any)
    vi.spyOn(core, 'generateQRCode').mockResolvedValue('<svg></svg>')

    render(
      <SmartQRCode
        value="https://example.com"
        onClickResolve
        onResolved={onResolved}
        ariaLabel="QR"
      />
    )

    fireEvent.click(screen.getByTestId('smartqr-container'))

    await waitFor(() => expect(onResolved).toHaveBeenCalled())
  })
})
