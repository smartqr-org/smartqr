# Smart QR

Smart QR is a modular library for generating and resolving QR codes with conditional rules and dynamic actions.

## Features

- **Framework-agnostic core** (`@smartqr/core`).
- Conditional rules based on OS, language, date range, rollout percentage, etc.
- Multiple actions: deep link, web URL, and more.
- Rule evaluation and execution logic separated from bindings.
- Minimal dependencies and tree-shakeable.
- SVG QR code generation with configurable colors, size, and margin.
- Designed to be extended with bindings for different frameworks (React, Vue, etc.).

## Architecture

- **Core (`@smartqr/core`)** — Framework-agnostic logic for rules, evaluation, and QR generation.
- **Bindings** — Framework-specific packages that wrap the core for easier usage in apps.
- **Demo** — Example apps demonstrating usage.

### Available bindings

- **[Core](./packages/core/README.md)** — framework-agnostic core logic.
- **[React](./packages/react/README.md)** — React hook (`useSmartQR`) and component (`<SmartQRCode />`).
- *(Vue binding coming soon)*

## Installation

Install the core package (required) and optionally a binding:

```bash
# Core only
pnpm add @smartqr/core

# With React binding
pnpm add @smartqr/core @smartqr/react
```

## Basic usage with Core

```ts
import { resolveAndExecute } from "@smartqr/core";

const rules = {
  rules: [
    { os: { include: ["iOS"] }, default: { type: "deeplink", url: "app://foo" } },
    { default: { type: "web", url: "https://example.com" } }
  ]
};

await resolveAndExecute(rules, { timeoutMs: 1500 });
```

## Basic usage with React

```tsx
import { SmartQRCode, useSmartQR } from "@smartqr/react";

// Hook usage
const { status, result, run } = useSmartQR({
  loadRules: () => fetch("/rules.json").then(r => r.json()),
  auto: false,
  timeoutMs: 1500,
  preferWebOnDesktop: true
});

// Component usage
<SmartQRCode
  value="https://example.com"
  size={256}
  onClickResolve
  onResolved={(res) => console.log("Resolved:", res)}
/>
```

Full documentation: [@smartqr/react README](./packages/react/README.md)

## Development

### Monorepo structure

```
/packages
  /core     — @smartqr/core
  /react    — @smartqr/react
  /vue      — (planned)
/apps
  /demo     — Example/demo apps
```

### Commands

- **Install dependencies**: `pnpm install`
- **Build all packages**: `pnpm -r build`
- **Run tests**: `pnpm -r test`
- **Start demo app**: `pnpm dev --filter demo`

### Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `chore:` — maintenance tasks
- `test:` — adding or updating tests

### PR workflow

1. Create a new branch from `main` following the format:  
   `feat/...`, `fix/...`, or `docs/...`.
2. Implement your changes.
3. Ensure all tests pass.
4. Open a PR linking related issues (`Closes #X`).

## License

[MIT](./LICENSE)
