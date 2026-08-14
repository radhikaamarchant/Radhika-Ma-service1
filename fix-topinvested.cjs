const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /const topInvested = isDesktop \?\n  \[\.\.\.businessesWithStats\]\.\n  includes\(deferredSearchTerm\.toLowerCase\(\)\)\n  \)\.\n  sort/,
  `const topInvested = isDesktop ?
  [...businessesWithStats].
  sort`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
