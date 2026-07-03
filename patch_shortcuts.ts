import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = `import { AppProvider, useAppContext } from "./utils/AppContext";`;
const importReplacement = `import { AppProvider, useAppContext } from "./utils/AppContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";`;

let updatedCode = code.replace(importStr, importReplacement);

const targetStr = `function MainLayout() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const { state, dispatch } = useAppContext();`;

const replacementStr = `function MainLayout() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const { state, dispatch } = useAppContext();

  // Keyboard Shortcuts Mapping
  useKeyboardShortcuts({
    'ctrl+s': () => {
      console.log('Saved data (Placeholder for Ctrl+S)');
    },
    'ctrl+k': () => {
      console.log('Open search (Placeholder for Ctrl+K)');
    },
    'shift+enter': () => {
      console.log('Performed Shift+Enter action');
    }
  });`;

if (updatedCode.includes(targetStr)) {
  updatedCode = updatedCode.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', updatedCode);
  console.log("Success");
} else {
  console.log("Target string not found!");
}
