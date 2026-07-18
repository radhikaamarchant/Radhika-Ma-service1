const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

code = code.replace(/i\.image/g, 'i.photoUrl');

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
