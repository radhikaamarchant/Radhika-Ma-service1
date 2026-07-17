const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

code = code.replace(
  /const increaseAmt = business\.triggerAmount \* totalQtyActive \* \(business\.increaseMarket \|\| 0\) \/ 100;\s*const downAmt = business\.triggerAmount \* totalQtyClosed \* \(business\.downMarket \|\| 0\) \/ 100;/g,
  `const increaseAmt = totalQtyActive * (business.increaseMarket || 0);
            const downAmt = totalQtyClosed * (business.downMarket || 0);`
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
