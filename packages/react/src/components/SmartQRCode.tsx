import React, { useEffect, useRef } from 'react';
import { generateQRCode, resolveAndExecute } from '@smartqr/core';

export type SmartQRCodeOptions = {
  size?: number;
  margin?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  /** Convenience color; mapped to darkColor */
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

function mapOptions(opts?: SmartQRCodeOptions) {
  if (!opts) return undefined;
  const out: Record<string, unknown> = {};
  if (opts.size !== undefined) out.size = opts.size;
  if (opts.margin !== undefined) out.margin = opts.margin;
  if (opts.level !== undefined) out.level = opts.level;
  if (opts.lightColor !== undefined) out.lightColor = opts.lightColor;
  // Prefer explicit darkColor; fallback to convenience `color`
  if (opts.darkColor !== undefined) out.darkColor = opts.darkColor;
  else if (opts.color !== undefined) out.darkColor = opts.color;
  if (opts.transparentLight !== undefined) out.transparentLight = opts.transparentLight;
  if (opts.version !== undefined) out.version = opts.version;
  return Object.keys(out).length ? out : undefined;
}

export const SmartQRCode: React.FC<SmartQRCodeProps> = ({ value, options, onResolved }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderSeq = useRef(0);

  useEffect(() => {
    let active = true;
    const seq = ++renderSeq.current;

    const doRender = async () => {
      const mapped = mapOptions(options);
      let svg: unknown;

      // Prefer object signature; fallback to (value, options)
      try {
        svg = await (generateQRCode as any)({ value, ...(mapped ?? {}) });
      } catch {
        svg = await (generateQRCode as any)(value, mapped);
      }

      // Some implementations might return { svg: string }
      const svgString =
        typeof svg === 'string'
          ? svg
          : svg && typeof (svg as any).svg === 'string'
            ? (svg as any).svg
            : undefined;

      if (!active || seq !== renderSeq.current) return;

      if (containerRef.current && svgString) {
        containerRef.current.innerHTML = svgString;
      }
    };

    void doRender();

    return () => {
      active = false;
    };
  }, [value, options]);

  const handleClick = async () => {
    if (!onResolved) return;
    try {
      // Use the core's parameter type without importing ResolveOptions directly
      type ResolveArg = Parameters<typeof resolveAndExecute>[0];
      // Build a minimal argument from current props; adapt when you add UA/lang/rules
      const arg = ({ value } as unknown) as ResolveArg;

      const info = await resolveAndExecute(arg);
      onResolved(info);
    } catch {
      // Keep UI stable even if resolver fails
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
