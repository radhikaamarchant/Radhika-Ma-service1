const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

content = content.replace(
  'const { marketTrends } = useMarketSimulation();',
  'const { marketState } = useMarketSimulation();\n  const marketTrends = marketState.trends;'
);

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched marketTrends in BusinessDetail");
