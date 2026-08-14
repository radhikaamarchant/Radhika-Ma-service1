const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /const topInvested = isDesktop \?\n  \[\.\.\.businessesWithStats\]\.\n  sort/,
  `const topInvested = isDesktop ?
  [...businessesWithStats].
  filter((b) =>
    b.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(deferredSearchTerm.toLowerCase())
  ).
  sort`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
