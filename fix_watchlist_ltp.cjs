const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf-8');
content = content.replace('{formatPrice(currentAmount)}', '{formatPrice(Math.abs(currentAmount))}');
fs.writeFileSync('src/components/BusinessSidebar.tsx', content);
console.log("Fixed Watchlist LTP display");
