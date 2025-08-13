import React from "react";
import { generateQRCode, type GenerateQROptions } from "@smartqr/core";

export interface SmartQRCodeProps extends GenerateQROptions {
  value: string;
  ariaLabel?: string;
  dataTestId?: string;
  onClickResolve?: () => void;
  onResolved?: (result: unknown) => void;
  options?: {
    size?: number;
    color?: string;
  };
}

export const SmartQRCode: React.FC<SmartQRCodeProps> = ({
                                                          value,
                                                          size,
                                                          margin,
                                                          level,
                                                          darkColor,
                                                          lightColor,
                                                          version,
                                                          transparentLight,
                                                          onClickResolve,
                                                          onResolved,
                                                          ariaLabel,
                                                          dataTestId,
                                                          options,
                                                        }) => {
  const [svg, setSvg] = React.useState<string>("");

  const opts: GenerateQROptions = React.useMemo(() => {
    const fromOptions: Partial<GenerateQROptions> = {
      size: options?.size,
      darkColor: options?.color, // color de la demo = darkColor del QR
    };

    const merged: Partial<GenerateQROptions> = {
      ...fromOptions,
      size: size ?? fromOptions.size,
      margin: margin ?? 2,
      level: level ?? "M",
      darkColor: darkColor ?? fromOptions.darkColor ?? "#000000",
      lightColor: lightColor ?? "#ffffff",
      version,
      transparentLight: transparentLight ?? false,
    };

    return merged as GenerateQROptions;
  }, [
    options?.size,
    options?.color,
    size,
    margin,
    level,
    darkColor,
    lightColor,
    version,
    transparentLight,
  ]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await generateQRCode(value, opts);
      if (!cancelled) setSvg(result as string);
    })();
    return () => {
      cancelled = true;
    };
  }, [value, opts]);

  const handleClick = () => {
    onClickResolve?.();
    onResolved?.({ value });
  };

  return (
    <div
      data-testid={dataTestId ?? "smartqr-container"}
      role="img"
      aria-label={ariaLabel ?? `QR code representing: ${value}`}
      onClick={onClickResolve ? handleClick : undefined}
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
};
