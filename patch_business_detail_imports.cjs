const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

if (!content.includes('import { useMarketSimulation }')) {
  content = content.replace(
    'import { useAppContext } from "../utils/AppContext";',
    'import { useAppContext } from "../utils/AppContext";\nimport { useMarketSimulation } from "../utils/MarketSimulationContext";'
  );
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched imports");
}
