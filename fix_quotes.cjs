const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(/\`₹\$\{formatLargeNumber\(totalLiveProfit\)\}\`/g, '₹{formatLargeNumber(totalLiveProfit)}');

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed quotes");
