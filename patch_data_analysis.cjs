const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// Add triggerAmount to businessesWithStats mapping
code = code.replace(
  /activeLiveTotalValue,\n      liveTotalValue,\n      profitAmount,\n      activeTotalInv,\n/g,
  "activeLiveTotalValue,\n      liveTotalValue,\n      profitAmount,\n      activeTotalInv,\n      triggerAmount: b.triggerAmount,\n"
);

// Update mobile view
code = code.replace(
  /\{b\.activeTotalInv === 0 \? formatINR\(0\) : formatINR\(b\.activeLiveTotalValue\)\}/g,
  "{b.triggerAmount ? formatINR(b.triggerAmount) : '-'}"
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
