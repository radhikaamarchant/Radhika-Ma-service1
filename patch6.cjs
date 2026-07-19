const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

if (!content.includes('Users')) {
  content = content.replace(/X,\s*ArrowUpDown,/, 'X, ArrowUpDown, Users, ChevronDown,');
}

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
