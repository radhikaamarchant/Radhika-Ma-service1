const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(/const { profit } = calculateLiveProfit\(\[inv\], b\.id, marketState\.trends, state\.settings\);\s*totalProfit \+= profit;/g, 
`const { liveProfit } = calculateLiveProfit([inv], b.id, marketState.trends, state.settings);
                            totalProfit += liveProfit;`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Patched correctly");
