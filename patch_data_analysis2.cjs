const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /activeLiveTotalValue,\n      overallTrend,/g,
  "activeLiveTotalValue,\n      triggerAmount: b.triggerAmount,\n      overallTrend,"
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
