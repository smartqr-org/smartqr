import React, { useEffect, useRef } from 'react';
import { generateQRCode, resolveAndExecute } from '@smartqr/core';

export type SmartQRCodeOptions = {
  size?: number;
  margin?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  color?: string;
  darkColor?: string;
  lightColor?: string;
  transparentLight?: boolean;
  version?: number;
};

export interface SmartQRCodeProps {
  value: string;
  options?: SmartQRCodeOptions;
  onResolved?: (info: unknown) => void;
}

/**
 * Renders a QR code into a <div> via innerHTML (SVG string).
 * - Accessible: role="img" + aria-label with the value.
 * - Options are forwarded to core.generateQRCode (supports both call signatures).
 */
export const SmartQRCode: React.FC<SmartQRCodeProps> = ({ value, options, onResolved }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize/clean options: only include defined keys
  const mapOptions = (opts?: SmartQRCodeOptions) => {
    if (!opts) return undefined;
    const out: Record<string, unknown> = {};
    if (opts.size !== undefined) out.size = opts.size;
    if (opts.margin !== undefined) out.margin = opts.margin;
    if (opts.level) out.level = opts.level;
    if (opts.lightColor) out.lightColor = opts.lightColor;
    // Prefer explicit darkColor; fallback to "color"
    if (opts.darkColor) out.darkColor = opts.darkColor;
    else if (opts.color) out.darkColor = opts.color;
    if (opts.transparentLight !== undefined) out.transparentLight = opts.transparentLight;
    if (opts.version !== undefined) out.version = opts.version;
    return Object.keys(out).length ? out : undefined;
  };

  useEffect(() => {
    let mounted = true;

    const render = async () => {
      const mapped = mapOptions(options);
      let svg: unknown;

      // Prefer object signature; fallback to (value, options)
      try {
        svg = await (generateQRCode as any)({ value, ...(mapped ?? {}) });
      } catch {
        svg = await (generateQRCode as any)(value, mapped);
      }

      if (mounted && containerRef.current && typeof svg === 'string') {
        containerRef.current.innerHTML = svg;
      }
    };

    render();

    return () => {
      mounted = false;
    };
  }, [value, options]);

  const handleClick = async () => {
    if (!onResolved) return;
    try {
      // Minimal resolve; extend with real context when needed
      const info = await resolveAndExecute({ value });
      onResolved(info);
    } catch {
      // No-op: keep UI stable even if resolver fails
    }
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`QR code representing: ${value}`}
      data-testid="smartqr-container"
      onClick={handleClick}
    />
  );
};
