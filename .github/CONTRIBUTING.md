# Contributing to @smartqr/core

First of all, thank you for your interest in contributing! 🚀  
We welcome contributions from anyone willing to help improve **Smart QR**.

---

## 📦 Project Structure

This package is part of a monorepo managed with **pnpm workspaces**.

```
packages/
  core/           # This package
  ...
```

---

## 🛠 Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x

Install dependencies:

    pnpm install

---

## ▶ Running the Project

Navigate to the package:

    cd packages/core

Run tests:

    pnpm test

Run linter:

    pnpm lint

---

## 📐 Coding Standards

- **Language:** TypeScript.
- **Formatting:** Prettier.
- **Linting:** ESLint.
- **Validation:** Use `zod` for runtime validation.
- Keep dependencies **minimal** — avoid unnecessary external packages.

---

## 🔄 Workflow

1. **Create an Issue**  
   Describe the change or bug fix before starting work.

2. **Branch Naming**  
   Follow the pattern:
  - `feat/feature-name`
  - `fix/bug-description`
  - `chore/task-name`

3. **Commit Messages**  
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add dateRange rule to RulesSchema
   fix: correct fallback logic in resolveAndExecute
   chore: update README
   ```

4. **Pull Requests**
  - Link the PR to the related issue.
  - Ensure all tests pass.
  - Request review from a maintainer.
  - Follow the PR Template in `.github/PULL_REQUEST_TEMPLATE.md`.

---

## 🧪 Testing

We use **Vitest** for unit tests.

- Place tests in `tests/` or alongside the module with `.test.ts` suffix.
- Use **fake timers** (`vi.useFakeTimers`) for timeout-related logic.
- Use **snapshot testing** for QR code SVG output.

Run tests:

    pnpm test

---

## 💬 Communication

- For questions, use the GitHub Issues page.
- Keep discussions public for transparency.

---

Thanks for helping make **Smart QR** better! 💙
