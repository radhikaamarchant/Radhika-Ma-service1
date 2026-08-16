const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

code = code.replace(/\}, \[groupedInvestments, state\.businesses, state\.investors, marketState\.trends, state\.settings, blueTickBusinessIds\]\);/, '}, [groupedInvestments, state.businesses, state.investors, marketState.trends, state.settings, blueTickBusinessIds, visibleCount]);');

fs.writeFileSync('src/pages/Investments.tsx', code);
