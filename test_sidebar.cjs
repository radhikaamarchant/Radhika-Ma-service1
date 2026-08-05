const fs = require('fs');
console.log(fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8').includes('marketState.trends'));
