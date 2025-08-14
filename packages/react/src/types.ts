export type UseSmartQRStatus = "idle" | "running" | "done" | "error";

export interface UseSmartQROptions {
  id?: string;
  loadRules: () => Promise<unknown> | unknown;
  preferWebOnDesktop?: boolean;
  timeoutMs?: number;
  auto?: boolean;
  navigate?: (url: string) => void;
}

export interface UseSmartQRReturn {
  status: UseSmartQRStatus;
  result?: unknown;
  error?: unknown;
  run: () => Promise<void>;
  reset: () => void;
}

export type QRLevel = "L" | "M" | "Q" | "H";
export interface GenerateQROptionsLite {
  size?: number;
  margin?: number;
  level?: QRLevel;
  darkColor?: string;
  lightColor?: string;
  version?: number;
  transparentLight?: boolean;
}

export interface SmartQRCodeProps extends GenerateQROptionsLite {
  value?: string;
  rulesUrl?: string;

  preferWebOnDesktop?: boolean;
  timeoutMs?: number;
  id?: string;

  className?: string;
  style?: React.CSSProperties;

  onClickResolve?: boolean;
  onResolved?: (r: unknown) => void;
}
