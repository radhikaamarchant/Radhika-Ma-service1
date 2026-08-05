const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(/<div className="absolute inset-0 z-50 bg-white dark:bg-\\[#222222\\] animate-in slide-in-from-right-4 duration-300 rounded-lg shadow-xl border border-kite-border flex flex-col">/,
`<div className="bg-white dark:bg-[#222222] animate-in slide-in-from-right-4 duration-300 rounded-lg shadow-xl border border-kite-border flex flex-col min-h-[80vh]">`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Patched absolute positioned div");
