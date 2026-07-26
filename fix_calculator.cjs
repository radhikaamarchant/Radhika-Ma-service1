const fs = require('fs');
let content = fs.readFileSync('src/utils/profitCalculator.ts', 'utf-8');

content = content.replace(
  /liveTrendPercentage: marketTrends\[businessId\] \|\| 0,/,
  'liveTrendPercentage: financials.capitalInvested > 0 ? (financials.profitBooked / financials.capitalInvested) * 100 : 0,'
);

fs.writeFileSync('src/utils/profitCalculator.ts', content);
console.log("Fixed profitCalculator.ts");
