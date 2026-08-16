const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// remove holdingGroupedCount and positionsGroupedCount definitions
code = code.replace(/const holdingGroupedCount = useMemo\(\(\) => allGroupedInvestments\.filter\([\s\S]*?\}\)\.length, \[allGroupedInvestments, marketState\.trends, state\.settings\]\);/g, '');

fs.writeFileSync('src/pages/Investments.tsx', code);
