const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  /const formData: Investor = \{/g,
  'const actualNewInvestor: Investor = {'
);
content = content.replace(
  /dispatch\(\{ type: "ADD_INVESTOR", payload: formData \}\);/g,
  'dispatch({ type: "ADD_INVESTOR", payload: actualNewInvestor });'
);

fs.writeFileSync('src/pages/Investors.tsx', content);

