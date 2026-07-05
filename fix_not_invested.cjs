const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(/<span className="text-kite-text-light">-<\/span>/g, '<span className="text-kite-text-light">NOT INVESTED</span>');

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed NOT INVESTED");
