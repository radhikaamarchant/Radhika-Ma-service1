const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

if (!content.includes('import { useKeyboardShortcuts }')) {
  content = content.replace(
    /import \{ useAppContext \} from"\.\.\/utils\/AppContext";/,
    'import { useAppContext } from"../utils/AppContext";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";'
  );
  fs.writeFileSync('src/pages/Investments.tsx', content);
}
