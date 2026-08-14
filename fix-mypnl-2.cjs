const fs = require('fs');
let code = fs.readFileSync('src/pages/MyPnLDesktop.tsx', 'utf8');

code = code.replace(
  '{businessAccounts.map((acc, idx) => (',
  '{businessAccounts.map((acc: UnifiedAccount, idx) => ('
);

code = code.replace(
  '{investorAccounts.map((acc, idx) => (',
  '{investorAccounts.map((acc: UnifiedAccount, idx) => ('
);

fs.writeFileSync('src/pages/MyPnLDesktop.tsx', code);
