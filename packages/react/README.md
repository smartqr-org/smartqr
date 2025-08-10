# @smartqr/react

React bindings for **Smart QR**.

## Install

```bash
pnpm add @smartqr/react @smartqr/core
```

## API

### `useSmartQR(options)`

Runs the Smart QR resolver and exposes status, result, and helpers.

```ts
const { status, result, error, run, reset } = useSmartQR({
  loadRules: () => fetch("/rules.json").then(r => r.json()),
  preferWebOnDesktop: true,
  timeoutMs: 1500,
  auto: false,
  navigate: (url) => window.location.assign(url)
});
```

#### Options
| Name                 | Type                                        | Required | Default                          | Description |
|----------------------|---------------------------------------------|----------|-----------------------------------|-------------|
| `loadRules`          | `() => Promise<unknown> \| unknown`        | ✅       | —                                 | Function that returns the rules object or JSON. |
| `id`                 | `string`                                    | ❌       | —                                 | Optional identifier for logging or analytics. |
| `preferWebOnDesktop` | `boolean`                                   | ❌       | `false`                           | Skip deep link on desktop and go to web directly. |
| `timeoutMs`          | `number`                                    | ❌       | `2000`                            | Time to wait before falling back from deep link on mobile. |
| `auto`               | `boolean`                                   | ❌       | `false`                           | If `true`, run automatically on mount. |
| `navigate`           | `(url: string) => void`                     | ❌       | `window.location.assign`          | Override navigation function (useful for SPA routing or testing). |
| `context`            | `Partial<EvaluateContext>`                  | ❌       | —                                 | Override OS/lang/time/rollout for testing. |

#### Return
| Property  | Type                                    | Description |
|-----------|-----------------------------------------|-------------|
| `status`  | `"idle" \| "running" \| "done" \| "error"` | Current execution status. |
| `result`  | `ResolveResult`                         | Output from the resolver. |
| `error`   | `unknown`                                | Error object if status is `"error"`. |
| `run`     | `() => Promise<void>`                   | Manually execute the resolver. |
| `reset`   | `() => void`                            | Reset state to `"idle"`. |

---

### `<SmartQRCode />`

Renders a QR code SVG and can optionally resolve on click.

```tsx
<SmartQRCode
  rulesUrl="/rules.json"
  onClickResolve
  timeoutMs={1500}
  className="w-64 h-64"
/>
```

Alternatively:

```tsx
<SmartQRCode value="https://example.com" onClickResolve />
```

#### Props
| Name                 | Type                          | Required | Default     | Description |
|----------------------|-------------------------------|----------|-------------|-------------|
| `value`              | `string`                      | ❌       | —           | Direct string payload (e.g. URL). |
| `rulesUrl`           | `string`                      | ❌       | —           | URL to a remote JSON with rules. |
| `preferWebOnDesktop` | `boolean`                     | ❌       | `false`     | Skip deep link on desktop and go to web directly. |
| `timeoutMs`          | `number`                      | ❌       | `2000`      | Time to wait before falling back from deep link on mobile. |
| `id`                 | `string`                      | ❌       | —           | Optional identifier for logging or analytics. |
| `className`          | `string`                      | ❌       | —           | CSS class for wrapper element. |
| `style`              | `React.CSSProperties`         | ❌       | —           | Inline styles for wrapper element. |
| `size`               | `number`                      | ❌       | `256`       | QR code size in pixels. |
| `margin`             | `number`                      | ❌       | `4`         | QR code margin in modules. |
| `darkColor`          | `string`                      | ❌       | `#000000`   | Foreground color. |
| `lightColor`         | `string`                      | ❌       | `#ffffff`   | Background color. |
| `transparent`        | `boolean`                     | ❌       | `false`     | Transparent background instead of `lightColor`. |
| `onClickResolve`     | `boolean`                     | ❌       | `false`     | Trigger resolver when QR is clicked. |
| `onResolved`         | `(r: ResolveResult) => void`   | ❌       | —           | Callback after a successful resolution. |

---

## Examples

### Auto-resolve on mount
```tsx
import { useSmartQR } from "@smartqr/react";

export default function AutoRunExample() {
  const { status, result } = useSmartQR({
    loadRules: () => fetch("/rules.json").then(r => r.json()),
    auto: true,
    timeoutMs: 1500,
    preferWebOnDesktop: true
  });

  return (
    <div>
      <p>Status: {status}</p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### Click-to-resolve QR
```tsx
import { SmartQRCode } from "@smartqr/react";

export default function ClickQRExample() {
  return (
    <SmartQRCode
      value="https://example.com"
      size={256}
      onClickResolve
      onResolved={(res) => console.log("Resolved:", res)}
    />
  );
}
```

---

## Testing

This package uses **Vitest** + **@testing-library/react**.  
Mobile fallback is tested using `vi.useFakeTimers()` to avoid real waiting.

Example:
```ts
vi.useFakeTimers();

const navigate = vi.fn();
const loadRules = () => ({
  rules: [
    {
      os: { include: ["iOS", "Android"] },
      default: { type: "deeplink", url: "app://foo" },
      fallback: { type: "web", url: "https://example.com/mobile" }
    },
    { default: { type: "web", url: "https://example.com/desktop" } }
  ]
});

const { result } = renderHook(() =>
  useSmartQR({ loadRules, timeoutMs: 1500, navigate })
);

await act(async () => {
  const p = result.current.run();
  vi.advanceTimersByTime(1600);
  await p;
});

expect(navigate).toHaveBeenCalled();
```

---

## License

[MIT](../../LICENSE)
