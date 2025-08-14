import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor, within } from '@testing-library/react';
import { SmartQRCode } from '../index';

describe('SmartQRCode (integration)', () => {
  it('renders a valid SVG for a basic payload', async () => {
    const { container } = render(<SmartQRCode value="https://example.com" />);
    const scoped = within(container);

    await waitFor(() => {
      const node = scoped.getByTestId('smartqr-container');
      expect(node.innerHTML.toLowerCase()).toContain('<svg');
    });
  }, 15000);

  it('updates SVG when props change', async () => {
    const { container, rerender } = render(<SmartQRCode value="https://example.com" />);
    const scoped = within(container);

    await waitFor(() => {
      const node = scoped.getByTestId('smartqr-container');
      expect(node.innerHTML.toLowerCase()).toContain('<svg');
    });

    rerender(<SmartQRCode value="https://example.com/changed" />);

    await waitFor(() => {
      const node = scoped.getByTestId('smartqr-container');
      expect(node.innerHTML.toLowerCase()).toContain('<svg');
    });

    const nodes = scoped.getAllByTestId('smartqr-container');
    expect(nodes).toHaveLength(1);
  }, 15000);
});
