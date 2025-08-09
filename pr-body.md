### Summary

This PR implements the SVG QR code generator for the `@smartqr/core` package, completing the work for **issue #6**.

### Changes

- Added `generateQRCode` function using the `qrcode` library for SVG output.
- Support for:
  - Custom size
  - Dark and light colors
  - Margin
  - Error correction level
  - Transparent light modules (`transparentLight: true`)
- Added unit tests with Vitest:
  - Generates valid SVG string with default options
  - Respects custom size and colors
  - Supports transparent light modules
  - Snapshot test to ensure output stability
- Generated initial snapshot for deterministic output.

### QA / Verification steps

- Run `pnpm -C packages/core test` → all tests should pass, including snapshot comparison.
- Visual inspection of the generated SVG when opening in a browser.
- Verified transparent modules are rendered correctly (via manual inspection).

### Linked issues

Closes #6
