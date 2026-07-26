const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(/key=\{app\.id\}/g, 'key={`${app.id}-${Math.random().toString(36).substr(2, 5)}`}');

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched Investors.tsx keys");
