# Smart QR

Smart QR is an **open source, modular QR code system** that allows you to define conditional rules for each QR and execute dynamic actions when scanned.
It is designed to be lightweight, framework-agnostic at its core, and easy to integrate with React, Vue, or any frontend.

---

## 📦 Monorepo Structure

This repository is a **pnpm workspace** containing multiple packages:

```
packages/
  core/           # Framework-agnostic core logic
  react/          # React bindings (planned)
  vue/            # Vue bindings (planned)
  demo/           # Demo app deployed to Vercel (planned)
```

---

## 🚀 Features

- **Rules-based execution**: target by OS, language, date range, rollout percentage.
- **Dynamic deep link + fallback** navigation logic.
- **QR code generation** in SVG with customizable size, colors, and transparency.
- **Framework bindings** for React and Vue (coming soon).
- **Lightweight core** with minimal dependencies.
- **Unit & snapshot testing** with Vitest.

---

## 🛠 Installation

To install the core package:

```bash
pnpm add @smartqr/core
```

React and Vue bindings will be available in future releases.

---

## 🧩 How It Works

1. **Generate a QR** with an encoded payload (static or pointing to a remote JSON).
2. **Load and validate rules** using the core schema.
3. **Evaluate rules** against the scanning device's context (OS, language, date, rollout).
4. **Resolve and execute** the matching action:
   - On **mobile**: try deep link → if not opened within timeout → fallback to web.
   - On **desktop**: optionally go directly to web if `preferWebOnDesktop` is set.

---

## 🧪 Development Setup

Clone the repo:

```bash
git clone https://github.com/<your-org>/smart-qr.git
cd smart-qr
```

Install dependencies:

```bash
pnpm install
```

Run tests for all packages:

```bash
pnpm test
```

---

## 📄 Documentation

- [Core README](./packages/core/README.md)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- License: [MIT](./LICENSE)

---

## 📝 Contributing

We welcome contributions!
See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines, commit conventions, and PR workflow.

---

## 📄 License

[MIT](./LICENSE) © 2025 Ángel Méndez
