import fs from 'fs';
let content = fs.readFileSync('src/index.css', 'utf8');

// Remove @media (min-width: 1024px) { and its closing brace
content = content.replace(/\/\* Force Zerodha Kite Dark Theme on Desktop \(\>= 1024px\) \*\/\n@media \(min-width: 1024px\) \{\n/g, '/* Force Zerodha Kite Dark Theme */\n');

// The closing brace is at the end of the block, before /* Maintain true white color
content = content.replace(/  \}\n\}\n\n\/\* Maintain true white color/g, '  }\n\n/* Maintain true white color');

fs.writeFileSync('src/index.css', content);
