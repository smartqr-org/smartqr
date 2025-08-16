# Contributing to SmartQR

Thanks for your interest in contributing! This guide explains how to set up the repo, run tests, follow conventions, and ship changes safely.

---

## Support matrix

- **Node:** 18, 20+
- **Package manager:** pnpm ≥ 10
- **React:** 18+
- **Browsers:** last 2 evergreen versions

---

## Repository layout

```
packages/
  core/        @smartqr/core — framework-agnostic logic (rules, resolve/execute, QR generator)
  react/       @smartqr/react — React bindings (hook + <SmartQRCode />)
examples/
  demo-react/  Vite + React demo (deployed to Vercel)
```

---

## Prerequisites

- Node 18 or 20
- pnpm 10+  
  ```bash
  corepack enable
  corepack prepare pnpm@10.14.0 --activate
  ```

---

## Getting started

```bash
pnpm install
pnpm -w run build            # build all packages
pnpm -w run test             # run unit tests
pnpm -w run test:coverage    # coverage (lcov)
pnpm -C examples/demo-react dev  # run demo locally
```

> **Demo rules:** place JSON files under `examples/demo-react/public/rules/` (e.g. `demo.json`).  
> They will be served as `/rules/demo.json`.  
> Optional bundled **fallbacks** can live in `examples/demo-react/src/rules/` (loaded via `import.meta.glob(..., { eager: true })`).

---

## Development scripts (root)

- **Build:** `pnpm -w -r build`
- **Lint:** `pnpm -w run lint`
- **Typecheck:** `pnpm -w run typecheck`
- **Tests:** `pnpm -w run test`
- **Coverage:** `pnpm -w run test:coverage`
- **Validate rules JSON (example):**  
  `pnpm tsx scripts/validate-rules.ts ./examples/demo-react/public/rules/demo.json`

---

## Coding standards

- **Language:** TypeScript (strict).
- **Formatting:** Prettier.
- **Linting:** ESLint (`@typescript-eslint`), no `any` unless justified.
- Avoid empty `catch` blocks; log with context or rethrow.
- In React, ensure accessibility: `<SmartQRCode />` renders `role="img"` + `aria-label`.

---

## Testing guidelines

- **Vitest** + **@testing-library**.  
- Enable matchers via `@testing-library/jest-dom/vitest` in test setup.
- For integration tests, prefer `within(container)` to avoid duplicate DOM matches (especially under coverage).
- Keep tests deterministic; use fake timers where appropriate.
- Coverage thresholds managed in `codecov.yml`.

Run:
```bash
pnpm -w run test
pnpm -w run test:coverage
```

---

## Branching & commits

- Branch from `main` with prefixes: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `test/*`.
- **Conventional Commits**:
  - `feat: add rollout rule`
  - `fix: forward options to QR core`
  - `chore(ci): harden release workflow`
  - `feat!: rename option 'color' -> 'darkColor'` (breaking)

---

## Pull Requests

1. Ensure `pnpm -w run test` and `pnpm -w -r build` pass locally.
2. Follow the PR template (enforced in CI).
3. Link issues with `Closes #123` / `Relates to #123`.
4. For user-facing changes in packages, **add a Changeset**:
   ```bash
   pnpm changeset
   # select affected packages and bump type (patch/minor/major)
   ```
5. Push and open the PR. CI runs lint, typecheck, build, tests, and uploads coverage to Codecov.

**PR checklist**

- [ ] Tests updated/added when needed  
- [ ] README/docs updated when needed  
- [ ] Follows ESLint/Prettier formatting  
- [ ] Changeset added (if user-facing change)  

---

## Versioning & release

We use **Changesets** and a **Release workflow** gated by an **Environment**:

- On merge to `main`, the workflow will either:
  1) Open a **“Version Packages” PR** (when there are pending changesets), or  
  2) **Publish to npm** if versions are already bumped on `main`.

### Who can publish?

- The publish job targets an **Environment** named `npm-publish` with **Required reviewers** (maintainers).  
- Add **`NPM_TOKEN`** as an environment secret (not at repository level).  
- The job uses **OIDC** and `--provenance` for supply-chain attestation.

> To ensure only maintainers can publish: protect `main` + CODEOWNERS + environment required reviewers.

---

## npm scope & package names

- If you own the npm organization **`@smartqr`**, keep package names as `@smartqr/core` and `@smartqr/react`. Ensure your token has publish rights (optionally configure `scope` in `setup-node`).
- If you **don’t** own that scope, use unscoped or user-scoped names (e.g. `smartqr-core`, `smartqr-react` or `@youruser/smartqr-core`).

Each package should include:

```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true
  },
  "files": ["dist", "README.md", "LICENSE"]
}
```

---

## Coverage & Codecov

- Coverage is uploaded from CI (lcov).  
- You can disable PR comments and rely on Checks only via `codecov.yml`:
  ```yaml
  comment: false
  github_checks:
    annotations: true
  coverage:
    status:
      project:
        default:
          target: auto
          threshold: 1%
      patch:
        default:
          target: 80%
          threshold: 1%
  ```

---

## Security

- Report vulnerabilities privately via GitHub Security Advisories or email (see `SECURITY.md`).
- Do **not** commit secrets or a `.npmrc` with tokens.

---

## SSR / Next.js

- The React binding injects an **SVG** string into a `<div>`; SSR/SSG-friendly.
- For prerendering, ensure deterministic inputs (avoid browser-only APIs during build).

---

## Troubleshooting

- **No `<svg>` in tests:** scope queries with `within(container)` and `await` until `innerHTML` contains `<svg>`.
- **Vercel demo 404 (`/rules/demo.json`):** put rules under `examples/demo-react/public/rules/` and load via `import.meta.env.BASE_URL`.
- **“Scope not found” on npm publish:** you’re using a scope you don’t own (e.g. `@smartqr`). Use the correct org or unscoped names.

---

## Quick PR via CLI

```bash
git checkout -b feat/better-rollout
pnpm -w run build && pnpm -w run test
pnpm changeset
git add -A && git commit -m "feat: rollout rule supports 0–100 numeric threshold"
git push -u origin feat/better-rollout
gh pr create --fill
```

Thanks for helping make **SmartQR** better! 💙
