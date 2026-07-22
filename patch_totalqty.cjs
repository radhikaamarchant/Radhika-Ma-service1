const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(
  /const totalQty = activeInvs\.reduce\(\(sum, inv: any\) => sum \+ \(inv\.quantity \|\| \(selectedBusiness\?\.triggerAmount \? Math\.floor\(inv\.amount \/ selectedBusiness\.triggerAmount\) : 0\)\), 0\);/g,
  `const totalQty = activeInvs.reduce((sum, inv: any) => sum + (Number(inv.quantity) || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1), 0);`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched totalQty fallback");
