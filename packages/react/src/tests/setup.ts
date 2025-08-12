// packages/react/src/tests/setup.ts
// 📝 Ensure jest-dom matchers (toHaveAttribute, toBeInTheDocument, etc.) are available in Vitest.
import '@testing-library/jest-dom/vitest'

// Optional: silence act warnings in React 18/19 test envs.
declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
