const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
code = code.replace(/hide-scrollbar pb-32/g, 'hide-scrollbar pb-4');
fs.writeFileSync('src/pages/Investments.tsx', code);
