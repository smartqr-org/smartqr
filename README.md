# Smart QR

[![@smartqr/core on npm](https://img.shields.io/npm/v/%40smartqr%2Fcore)](https://www.npmjs.com/package/@smartqr/core)
[![@smartqr/react on npm](https://img.shields.io/npm/v/%40smartqr%2Freact)](https://www.npmjs.com/package/@smartqr/react)
[![CI](https://github.com/AngelMdez/smartqr/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AngelMdez/smartqr/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/AngelMdez/smartqr/branch/main/graph/badge.svg)](https://codecov.io/gh/AngelMdez/smartqr)

**Smart QR** is a modular library to **generate** and **resolve** QR codes with conditional rules and dynamic actions.

---

## Features

- **Framework‑agnostic core** (`@smartqr/core`) with no UI dependencies.
- Conditional rules: operating system, language, date range, rollout %, and more.
- Actions: deep link, web URL, etc.
- QR generation in **SVG** (colors, size, margin, error levels).
- Framework bindings (React first; more to come).
- Strong types with **TypeScript** (and **Zod** in the core).

---

## Architecture

- **Core (`@smartqr/core`)** — rules, evaluation, resolve/execute, and QR generation (framework‑agnostic).
- **Bindings** — thin UI wrappers over the core (e.g. React).
- **Demo** — minimal app for showcasing and validation.

### Packages

- **[`@smartqr/core`](./packages/core/README.md)** — business logic.
- **[`@smartqr/react`](./packages/react/README.md)** — hook (`useSmartQR`) + component (`<SmartQRCode />`).
- *(Vue/others coming soon)*

---

## Installation

```bash
# Core only
pnpm add @smartqr/core

# Core + React binding
pnpm add @smartqr/core @smartqr/react
```

---

## Quick start (Core)

```ts
import { resolveAndExecute } from '@smartqr/core'

const rules = {
  rules: [
    { os: { include: ['iOS'] }, default: { type: 'deeplink', url: 'app://foo' } },
    { default: { type: 'web', url: 'https://example.com' } },
  ],
}

// Run resolution/action on the client
await resolveAndExecute(rules, { timeoutMs: 1500 })
```

### Core: quick API

- `generateQRCode(value: string, options?) → Promise<string | { svg: string }>`
- `resolveAndExecute(options: ResolveOptions) → Promise<ResolveResult>`

> The QR generator may return a raw **SVG string** or an object `{ svg }`. The React binding supports both.

---

## Quick start (React)

```tsx
import { SmartQRCode, useSmartQR } from '@smartqr/react'

// Hook: trigger resolution on demand
const { status, result, launch } = useSmartQR({
  loadRules: () => fetch('/rules/campaign.json').then(r => r.json()),
  auto: false,
  timeoutMs: 1500,
})

// Component: static QR render + (optional) resolve on click
<SmartQRCode
  value="https://example.com"
  options={{ size: 256, darkColor: '#111' }}
  resolveOptions={{
    id: 'campaign',
    loadRules: () => fetch('/rules/campaign.json').then(r => r.json()),
  }}
  onResolved={(res) => console.log('Resolved:', res)}
/>
```

> **Accessibility:** the component renders `role="img"` and an `aria-label` derived from `value`.

### QR options (React/Core)

| Option              | Type                          | Description                                   |
|---------------------|-------------------------------|-----------------------------------------------|
| `size`              | `number`                      | Canvas size (px).                             |
| `margin`            | `number`                      | Margin around the code.                       |
| `level`             | `'L' \| 'M' \| 'Q' \| 'H'` | Error‑correction level.                       |
| `darkColor`         | `string`                      | Dark modules color (hex, rgb, …).             |
| `color` (alias)     | `string`                      | Alias for `darkColor`.                        |
| `lightColor`        | `string`                      | Light background color.                       |
| `transparentLight`  | `boolean`                     | Transparent background.                       |
| `version`           | `number`                      | QR version (usually not required).            |

---

## Monorepo

```
packages/
  core/       — @smartqr/core
  react/      — @smartqr/react
examples/
  demo-react  — Vite + React demo
```

---

## Useful scripts

- **Install**: `pnpm install`
- **Build**: `pnpm -r build`
- **Tests**: `pnpm -r test` (coverage: `pnpm -r test:coverage`)
- **Demo**: `pnpm -C examples/demo-react dev`

---

## SSR / Next.js

- The React binding injects an **SVG** string into a `<div>`, compatible with SSR/SSG.
- When pre‑rendering, ensure deterministic inputs (avoid browser‑only APIs at build time).

---

## Contributing

We use **Conventional Commits**, **Changesets** for versioning, and a unified CI (lint/typecheck/build/test + Codecov).

1. Branch from `main`: `feat/...`, `fix/...`, `docs/...`
2. Ensure `pnpm -w test` and `pnpm -r build` are green
3. Open a PR linking issues (`Closes #123`)

---

## License

[MIT](./LICENSE)
