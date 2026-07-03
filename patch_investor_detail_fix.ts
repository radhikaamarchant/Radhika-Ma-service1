import fs from 'fs';
let code = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');
code = code.replace(/\\n\\n/g, '\n\n');
fs.writeFileSync('src/components/InvestorDetail.tsx', code);
console.log("Success Fix InvestorDetail");
