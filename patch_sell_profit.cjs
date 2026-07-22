const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Update calculateSellStats to use trend
content = content.replace(
  /const avgPrice = overallActiveAmount \/ overallActiveQty;\s*totalCap = avgPrice \* qty;\s*totalProfit = \(currentMarketPrice \* qty\) - totalCap;/,
  `const avgPrice = overallActiveAmount / overallActiveQty;
        totalCap = avgPrice * qty;
        const trend = marketState?.trends?.[selectedBusiness.id] || 0;
        totalProfit = totalCap * (trend / 100);`
);

// Update submit logic to use trend for grossPayout
content = content.replace(
  /const avgPrice = inv\.amount \/ invQty;\s*const grossPayout = currentMarketPrice \* sellQty;/,
  `const avgPrice = inv.amount / invQty;
               const trend = marketState?.trends?.[selectedBusiness.id] || 0;
               const capUsed = avgPrice * sellQty;
               const profit = capUsed * (trend / 100);
               const grossPayout = capUsed + profit;`
);

content = content.replace(
  /const grossPayout = currentMarketPrice \* invQty;/,
  `const trend = marketState?.trends?.[selectedBusiness.id] || 0;
               const grossPayout = inv.amount + (inv.amount * (trend / 100));`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched sell profit calculation");
