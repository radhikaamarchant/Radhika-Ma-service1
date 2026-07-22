const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

code = code.replaceAll('<div className="flex-1 overflow-y-auto">', '<div className="flex-1 overflow-y-auto pb-12">');
code = code.replaceAll('<div className="flex-1 overflow-y-auto pb-8">', '<div className="flex-1 overflow-y-auto pb-12">');
code = code.replaceAll('<div className="flex-1 overflow-y-auto pb-3">', '<div className="flex-1 overflow-y-auto pb-12">');

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
