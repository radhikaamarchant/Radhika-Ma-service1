const fs = require('fs');

// Fix LivePortfolioDetail
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

// Replace return (() => { with if (!selectedInvestment) return null; \n
content = content.replace(
  /return \(\(\) => \{/,
  'if (!selectedInvestment) return null;\n'
);

content = content.replace(
  /\s*\}\)\(\);\s*\}\s*$/,
  '\n}\n'
);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);

// Fix Investments
let invContent = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// Inside Investments, it has:
// {selectedInvestment &&
//   (() => {
//     const business = ...
//     useKeyboardShortcuts(...)
//     ...
//     return (...)
//   })()
// }

// Wait, inside Investments, the IIFE is inside JSX!
