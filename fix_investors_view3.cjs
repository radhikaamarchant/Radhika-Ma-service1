const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(/  \}, \[isSearchExpanded\]\);\n+\s*\}, \[viewMode\]\);/, "  }, [isSearchExpanded]);");
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Syntax fixed.");
