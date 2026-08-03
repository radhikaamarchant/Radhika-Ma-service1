const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(/max-w-4xl max-h-\[90vh\]/, "max-w-5xl md:max-w-6xl max-h-[90vh]");
code = code.replace(/<div className="p-8 space-y-8">/, `<div className="p-4 md:p-8 space-y-8">`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
