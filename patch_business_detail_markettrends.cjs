const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

if (!content.includes('const { marketTrends } = useMarketSimulation();')) {
  content = content.replace(
    'const { state, dispatch } = useAppContext();',
    'const { state, dispatch } = useAppContext();\n  const { marketTrends } = useMarketSimulation();'
  );
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched marketTrends");
}
