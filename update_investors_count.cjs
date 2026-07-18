const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
code = code.replace('<span className="mr-3">{filteredInvestors.length}/250</span>', '<span className="mr-3">{state.investors.length}/250</span>');
fs.writeFileSync('src/pages/Investors.tsx', code);
