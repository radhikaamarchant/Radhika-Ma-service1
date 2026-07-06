const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
content = content.replace(
  />\s*EXIT\s*<\/button>/g,
  '>\n                             SELL\n                           </button>'
);
fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Patched Investments.tsx EXIT -> SELL");
