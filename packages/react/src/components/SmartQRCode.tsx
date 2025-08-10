import React from "react";
import { generateQRCode, type GenerateQROptions } from "@smartqr/core";

export interface SmartQRCodeProps extends GenerateQROptions {
  value: string;
  onClickResolve?: boolean;
  onResolved?: (result: unknown) => void;
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
                                                        }) => {
  const [svg, setSvg] = React.useState<string>("");

  const opts: GenerateQROptions = React.useMemo(
    () => ({
      size,
      margin,
      level,
      darkColor,
      lightColor,
      version,
      transparentLight,
    }),
    [size, margin, level, darkColor, lightColor, version, transparentLight]
  );

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
    if (onClickResolve) onResolved?.(value);
  };

  return (
    <div
      data-testid="smartqr-container"
      role="img"
      aria-label={`QR code representing: ${value}`}
      onClick={onClickResolve ? handleClick : undefined}
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
};
