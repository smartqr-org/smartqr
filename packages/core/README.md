# @smartqr/core

Core package of **Smart QR**.
Provides **rule validation**, **rule evaluation**, **action resolution** (deeplink/web/fallback), and **QR code generation** in SVG format.
Designed to be framework-agnostic, lightweight, and ready for integration with React/Vue bindings.

---

## 📦 Installation

    pnpm add @smartqr/core

---

## 🚀 Features

- **Rules validation** with [zod](https://github.com/colinhacks/zod).
- **Conditional evaluation** by OS, language, date range, rollout percentage.
- **Action resolution** with deep link / fallback logic.
- **SVG QR code generation** with customizable colors, size, and transparency.
- **Fully tested** with Vitest (unit tests + snapshot tests).
- **Minimal dependencies** for portability.

---

## 🗂 Package Structure

    src/
    ├── rules.ts        # Zod schema for rules validation
    ├── evaluate.ts     # Pure function to check if rules match a context
    ├── resolve.ts      # Orchestrates evaluation and executes actions
    ├── generator.ts    # Generates QR codes in SVG format
    └── index.ts        # Public API
    tests/
    ├── resolve.test.ts
    ├── generator.test.ts
    └── __snapshots__/  # Snapshot for QR SVG

---

## 🧩 API

### RulesSchema

    import { RulesSchema } from '@smartqr/core';

    const rules = RulesSchema.parse({
      os: ['iOS', 'Android'],
      lang: ['es', 'en'],
      dateRange: { from: new Date('2025-01-01'), to: new Date('2025-12-31') },
      rollout: 50,
      default: { url: 'https://fallback.example.com' }
    });

**Fields:**
- `os?: string[]`
- `lang?: string[]`
- `dateRange?: { from: Date; to: Date }`
- `rollout?: number` (0–100)
- `default: { url: string }` *(required)*

---

### evaluateRules(rules, context)

    import { evaluateRules } from '@smartqr/core';

    const result = evaluateRules(rules, {
      os: 'iOS',
      lang: 'es',
      now: new Date(),
      rolloutRandom: 42 // optional, for deterministic tests
    });

Returns: `true | false`.

---

### resolveAndExecute(rules, context, options)
