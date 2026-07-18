const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

code = code.replace(
  /<span className="text-\[10px\] text-gray-400 dark:text-\[#8F8F8F\] shrink-0">\(\{i\.investorId\}\)<\/span>\n/g,
  ''
);

code = code.replace(
  /<span className="text-\[10px\] text-gray-400 dark:text-\[#8F8F8F\] shrink-0">\(\{i\.investorId\}\)<\/span>/g,
  ''
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log('Replaced successfully');
