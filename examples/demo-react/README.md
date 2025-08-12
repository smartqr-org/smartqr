# SmartQR Demo React

This is a demo React application showcasing the capabilities of the **@smartqr/react** package, which is built on top of **@smartqr/core**.

## Features

- **Dynamic QR Generation**: Generate QR codes from custom payloads and configuration options.
- **Rule-based Resolution**: Test SmartQR's conditional rules engine with different example JSON payloads.
- **Real-time Interaction**: Click the QR code to trigger the `resolveAndExecute` function from the core package.
- **Dynamic Rule Selection**: Choose between different example rule sets from the UI.

## Project Structure

```
/demo-react
  ├── public/
  │    └── rules/                # Example JSON rule files (demo.json, ios-only.json, etc.)
  ├── src/
  │    ├── App.tsx                # Main demo UI with QR display and rule selection
  │    ├── components/            # Demo-specific components
  │    └── hooks/
  ├── package.json
  └── README.md
```

## How to Run Locally

1. Install dependencies (at the monorepo root):
   ```bash
   pnpm install
   ```

2. Go to the demo package:
   ```bash
   cd packages/demo-react
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser at `http://localhost:5173`.

## Usage

- Select one of the available rule sets from the dropdown menu.
- The QR code will update to represent the payload from the selected rules.
- Click the QR code to trigger the resolver logic (`resolveAndExecute`) with the selected payload.

## Adding New Example Rules

1. Place your new JSON file inside `public/rules/`.
2. Update the UI in `App.tsx` to include it in the dropdown selection.

## Deployment

This demo can be deployed easily to **Vercel** or any static hosting provider.

To build the production version:
```bash
pnpm build
```

Then deploy the contents of the `dist` folder.

---

**SmartQR** is an open-source project aiming to simplify conditional QR code generation and resolution.
For more details, see the main repository: [smartqr-org/smartqr](https://github.com/smartqr-org/smartqr)
