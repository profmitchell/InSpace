
# InSpace

TRY:  https://v0-in-space-gizmo-controller.vercel.app

<img width="231" alt="Screenshot 2025-04-22 at 4 50 53 AM" src="https://github.com/user-attachments/assets/384e46b3-0d15-4b85-acf0-4663cd8fd3be" />
<img width="184" alt="Screenshot 2025-04-22 at 4 51 06 AM" src="https://github.com/user-attachments/assets/05f4b749-7a77-452f-9a20-ca1958379b10" />



> A customizable 3D gizmo control React component for transform and rotate interactions along the X, Y, and Z axes.


<img width="1250" alt="Screenshot 2025-04-22 at 4 51 19 AM" src="https://github.com/user-attachments/assets/bf45ed82-7a11-4440-9344-ef4a384aa1f9" />

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Props](#props)
- [GizmoSettings](#gizmosettings)
- [Examples](#examples)
- [Development](#development)
- [Project Structure](#project-structure)
- [Distribution](#distribution)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Node.js v14 or higher
- React 17+ with TypeScript support
- (Optional) Tailwind CSS for styling

## Installation
```bash
npm install framer-motion
# or
yarn add framer-motion
```

## Quick Start
```tsx
import React from 'react';
import { InSpace } from './InSpace';

function App() {
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <InSpace mode="transform" />
    </div>
  );
}

export default App;
```

## Basic Usage
- Use `mode="transform"` for translation (move) mode.
- Use `mode="rotate"` for rotation mode.
- Toggle between modes via the built-in UI or `onToggleMode` callback.
- Hold **Shift** or enable `lockAxis` in settings to constrain to a single axis.

## Props
| Prop              | Type                     | Default     | Description                                 |
|-------------------|--------------------------|-------------|---------------------------------------------|
| `mode`            | `"transform" \| "rotate"`| **required**| Initial interaction mode.                   |
| `onToggleMode`    | `() => void` (optional)  | `undefined` | Callback fired when mode toggles.           |
| `initialSettings` | `Partial<GizmoSettings>` | `{}`        | Override default gizmo settings (below).    |

## GizmoSettings
Configure gizmo appearance & behavior via `initialSettings` or the settings panel:

| Setting               | Type    | Default  | Description                                     |
|-----------------------|---------|----------|-------------------------------------------------|
| `size`                | number  | `200`    | Diameter of the gizmo SVG container (px).       |
| `allowDragBeyondBounds` | boolean | `false` | Allow handle to drag outside the circle bounds. |
| `lockAxis`            | boolean | `true`   | Enable axis locking when dragging or rotating.  |
| `useColors`           | boolean | `true`   | Color axes (X: red, Y: green, Z: blue).         |
| `handleSize`          | number  | `10`     | Radius of draggable handles (px).               |
| `lineSize`            | number  | `2`      | Stroke width of axis lines (px).                |
| `showLabels`          | boolean | `true`   | Display axis labels and values.                 |

## Examples
### Custom Initial Settings
```tsx
<InSpace
  mode="rotate"
  initialSettings={{
    size: 300,
    lockAxis: false,
    useColors: false,
    showLabels: false,
  }}
  onToggleMode={() => console.log('Mode switched')}
/>
```

### Embedding in a Panel
```tsx
import { InSpace } from './InSpace';

function ControlPanel() {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold">3D Control Gizmo</h2>
      <InSpace mode="transform" />
    </div>
  );
}
```

## Development
```bash
npm install
npm run dev
# or
yarn install
yarn dev
```
- Starts a local dev server with hot-reload.

## Project Structure
```
inspace/
├─ src/
│  ├─ InSpace.tsx      # Main gizmo component
│  ├─ Settings.tsx     # Settings panel UI
│  └─ styles/          # Tailwind or custom CSS
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
└─ README.md           # This file
```

## Distribution

### Publishing to npm
1. Ensure your `package.json` includes fields for bundling and types:
   ```json
   {
     "main": "dist/index.cjs.js",
     "module": "dist/index.esm.js",
     "types": "dist/index.d.ts"
   }
   ```
2. Build your package:
   ```bash
   npm run build
   ```
3. Publish to npm (public):
   ```bash
   npm publish --access public
   ```

### Installation via npm
```bash
npm install your-package-name
# or
yarn add your-package-name
```
Import in your code:
```tsx
import { InSpace } from 'your-package-name';
```

### CDN Usage
Use via UNPKG:
```html
<script src="https://unpkg.com/your-package-name/dist/index.umd.js"></script>
```

## Contributing
1. Fork the repo.
2. Create feature branch (`git checkout -b feature/xyz`).
3. Commit with clear messages.
4. Open a pull request describing your changes.
5. Ensure tests pass and code is linted.

## License
MIT 
