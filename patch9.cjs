const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace('ArrowUpDown,', 'ArrowUpDown,\n  Users,');

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
