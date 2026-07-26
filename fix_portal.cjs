const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

content = content.replace(
  /\{\s*selectedPortfolioInvestment\s*&&\s*\(\s*\{createPortal\(/,
  '{selectedPortfolioInvestment && createPortal('
);

content = content.replace(
  /\/>, document\.body\)\}\s*\)/,
  '/>, document.body)}'
);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
