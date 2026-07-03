import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

code = code.replace('\\\\n\\\\n', '\\n\\n');

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success Investments");
