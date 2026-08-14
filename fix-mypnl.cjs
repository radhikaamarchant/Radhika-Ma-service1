const fs = require('fs');
let code = fs.readFileSync('src/pages/MyPnLDesktop.tsx', 'utf8');

code = code.replace(
  'const businessAccounts = Array.from(accountMap.values()).filter(a => !!a.businessData);',
  'const businessAccounts = Array.from(accountMap.values()).filter((a: UnifiedAccount) => !!a.businessData);'
);

code = code.replace(
  'const investorAccounts = Array.from(accountMap.values()).filter(a => !!a.investorData);',
  'const investorAccounts = Array.from(accountMap.values()).filter((a: UnifiedAccount) => !!a.investorData);'
);

fs.writeFileSync('src/pages/MyPnLDesktop.tsx', code);
