const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  /onWithdraw=\{\(\) => handleWithdrawClick\(selectedInvestor\)\}/,
  'onWithdraw={(invs) => {\n              if (invs && invs.length > 0) {\n                handleCreditInvestorClick(invs);\n              } else {\n                handleWithdrawClick(selectedInvestor);\n              }\n            }}'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched onWithdraw");
