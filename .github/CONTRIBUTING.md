# Contributing to SmartQR

Thanks for your interest in contributing! We welcome issues, pull requests, and ideas to make SmartQR better.

## Code of Conduct
By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to ask questions
- Use **GitHub Issues** with the label `question`.
- Be clear and include environment details (OS/Browser/Node, versions) and steps to reproduce if applicable.

## Reporting bugs
1. Search existing issues to avoid duplicates.
2. Open a new issue using the **Bug report** template. Please include:
  - Expected vs. actual behavior
  - Steps to reproduce
  - Logs, screenshots, or a minimal repro (StackBlitz/CodeSandbox if possible)
3. Add relevant labels (e.g., `bug`, `priority: high`).

## Requesting features
- Use the **Feature request** template.
- Explain the problem you’re trying to solve, not just the solution.
- Describe expected API/DX and possible alternatives.

## Project setup (monorepo)
Run these in the repository root:
- `pnpm install`
- `pnpm -r build`
- `pnpm -r test`

### Packages
- `@smartqr/core` — Rules schema, evaluation, resolver helpers
- `@smartqr/generator` — QR generation (SVG)
- `@smartqr/react` — React bindings (optional)
- `examples/demo-react` — Demo app (Vite)

## Development workflow
1. **Fork** the repo and create a feature branch:  
   `git checkout -b feat/my-feature`
2. Make changes with tests and docs.
3. Run checks locally:
  - `pnpm -r lint` (if configured)
  - `pnpm -r test`
  - `pnpm -r build`
4. **Commit** using Conventional Commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
5. **Open a Pull Request**:
  - Fill the PR template
  - Link related issues (e.g., `Closes #123`)
  - Keep PRs focused and reasonably small

## Testing
- Unit tests live alongside packages (e.g., `packages/core/tests`).
- Please add tests for new features and bug fixes.
- For major changes, consider adding integration/e2e tests.

## Documentation
- Update `README.md` and package-level docs for any user-facing changes.
- Provide code examples where helpful.

## Release process
We use **Changesets** to manage versions and releases:
- Maintainers run the release workflow to publish to npm.
- Contributors may be asked to add a changeset for user-facing changes.

## Style & guidelines
- TypeScript strict mode
- Small, composable modules
- Keep public APIs minimal and well-typed
- Favor explicit errors and clear DX
- Follow existing code style (ESLint/Prettier)

## Community
- Use **Issues** for bugs/features
- Use **Discussions** (if enabled) for open-ended topics
- Be respectful and constructive — see our Code of Conduct

Thanks again for contributing! 🙌
