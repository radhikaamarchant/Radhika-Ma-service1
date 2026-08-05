const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// Replace dark:text-[#BBBBBBD9] with text-desktop-dark-bbbbbbd9
code = code.replace(/dark:text-\\[#BBBBBBD9\\]/g, 'text-desktop-dark-bbbbbbd9');

// Replace dark:text-[#666666] with text-desktop-dark-666666
code = code.replace(/dark:text-\\[#666666\\]/g, 'text-desktop-dark-666666');

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Patched classes");
