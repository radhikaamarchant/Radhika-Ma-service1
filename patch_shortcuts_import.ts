import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('import { useKeyboardShortcuts }')) {
  code = code.replace('import { AppProvider } from "./utils/AppContext";', 'import { AppProvider } from "./utils/AppContext";\nimport { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";');
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success");
}
