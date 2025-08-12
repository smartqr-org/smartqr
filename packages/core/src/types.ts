export type SmartQRAction =
  | { type: 'deeplink'; url: string }
  | { type: 'web'; url: string }
  | { type: 'noop' };
