const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace('<div className="divide-y divide-kite-border/50">',
'<div className="divide-y divide-kite-border/50 border-b border-kite-border/50">');

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Patched horizontal border");
