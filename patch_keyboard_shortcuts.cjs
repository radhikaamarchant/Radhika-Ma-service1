const fs = require('fs');
let content = fs.readFileSync('src/hooks/useKeyboardShortcuts.ts', 'utf8');

// Modify so that standalone shift, control, alt can be captured if they want.
content = content.replace(
  /if \(\!\['control', 'shift', 'alt', 'meta'\]\.includes\(key\)\) \{/,
  'if (true) {'
);

fs.writeFileSync('src/hooks/useKeyboardShortcuts.ts', content);
