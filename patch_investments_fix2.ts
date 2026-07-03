import fs from 'fs';
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
code = code.replace(/\\n\\n/g, '\n\n');
fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success Fix2");
