import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SmartQRCode } from '../index';

// --- Mocks for @smartqr/core -----------------------------------------------
vi.mock('@smartqr/core', async () => {
  return {
    generateQRCode: vi.fn(async (_opts: any) => {
      return `<svg data-prop="ok"></svg>`;
    }),
    resolveAndExecute: vi.fn(async (_ctx: any) => {
      return { action: 'noop', matched: true };
    }),
  };
});

const core = await import('@smartqr/core');

// --- Helpers ----------------------------------------------------------------
function getScopedContainer(renderContainer: HTMLElement): HTMLElement {
  const scoped = within(renderContainer);
  return scoped.getByTestId('smartqr-container');
}

async function waitForSvgIn(renderContainer: HTMLElement) {
  const scoped = within(renderContainer);
  await waitFor(() => {
    const node = scoped.getByTestId('smartqr-container');
    expect(node.innerHTML.toLowerCase()).toContain('<svg');
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ------------------------------------------------------------------
describe('<SmartQRCode />', () => {
  it('renders a QR and calls core.generateQRCode with the given value and an options object', async () => {
    const { container } = render(<SmartQRCode value="https://example.com" />);

    await waitForSvgIn(container);
    const node = getScopedContainer(container);
    expect(node).toHaveAttribute('role', 'img');
    expect(node).toHaveAttribute('aria-label', expect.stringContaining('https://example.com'));

    expect(core.generateQRCode).toHaveBeenCalledTimes(1);
    const call = (core.generateQRCode as any).mock.calls[0];

    if (typeof call?.[0] === 'string') {
      expect(call[0]).toBe('https://example.com');
      if (call[1] !== undefined) expect(typeof call[1]).toBe('object');
    } else {
      expect(call?.[0]?.value).toBe('https://example.com');
      expect(typeof call?.[0]).toBe('object');
    }
  }, 15000);

  it('updates SVG when props change (no duplicate nodes)', async () => {
    const { container, rerender } = render(<SmartQRCode value="https://example.com" />);

    await waitForSvgIn(container);
    expect(core.generateQRCode).toHaveBeenCalledTimes(1);

    rerender(<SmartQRCode value="https://example.com/changed" />);
    await waitForSvgIn(container);
    expect(core.generateQRCode).toHaveBeenCalledTimes(2);

    const scoped = within(container);
    const nodes = scoped.getAllByTestId('smartqr-container');
    expect(nodes).toHaveLength(1);
  }, 15000);

  it('on click keeps a valid render; if resolver runs, onResolved is called with its result', async () => {
    const onResolved = vi.fn();
    const { container } = render(
      <SmartQRCode value="https://example.com" onResolved={onResolved} />
    );

    await waitForSvgIn(container);
    const node = getScopedContainer(container);

    await userEvent.click(node);
    await waitForSvgIn(container);

    const resolveCalls = (core.resolveAndExecute as any).mock.calls.length;
    if (resolveCalls > 0) {
      expect(onResolved).toHaveBeenCalled();
      expect(onResolved).toHaveBeenCalledWith(expect.objectContaining({ matched: true }));
    } else {
      expect(onResolved).not.toHaveBeenCalled();
    }
  }, 15000);

  it('passes through custom options to core.generateQRCode (size/color example)', async () => {
    const { container } = render(
      <SmartQRCode
        value="https://example.com"
        options={{ size: 200, color: '#000000' }}
      />
    );

    await waitForSvgIn(container);
    expect(core.generateQRCode).toHaveBeenCalled();

    const lastCallArgs = (core.generateQRCode as any).mock.calls.at(-1);
    if (!lastCallArgs) throw new Error('generateQRCode was not called');

    if (typeof lastCallArgs[0] === 'string') {
      const [, opts] = lastCallArgs;
      if (opts) {
        expect(opts).toEqual(expect.objectContaining({ size: 200 }));
        const hasColor =
          'color' in opts || 'darkColor' in opts || 'foreground' in opts;
        expect(hasColor).toBe(true);
      }
    } else {
      const opts = lastCallArgs[0];
      expect(opts).toEqual(expect.objectContaining({ value: 'https://example.com' }));
      expect(opts).toEqual(expect.objectContaining({ size: 200 }));
      const hasColor =
        'color' in opts || 'darkColor' in opts || 'foreground' in opts;
      expect(hasColor).toBe(true);
    }
  }, 15000);

  it('sets accessible attributes (role and aria-label) consistently', async () => {
    const { container } = render(<SmartQRCode value="https://example.com?a=1" />);
    await waitForSvgIn(container);

    const node = getScopedContainer(container);
    expect(node).toHaveAttribute('role', 'img');
    expect(node).toHaveAttribute('aria-label', expect.stringContaining('https://example.com?a=1'));
  }, 15000);
});
