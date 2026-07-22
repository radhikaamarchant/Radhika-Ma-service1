const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(
  /overallActiveQty \+= \(inv\.quantity \|\| \(selectedBusiness\.triggerAmount \? Math\.floor\(inv\.amount \/ selectedBusiness\.triggerAmount\) : 0\)\);/,
  `overallActiveQty += (Number(inv.quantity) || (selectedBusiness.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1);`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched overallActiveQty fallback");
