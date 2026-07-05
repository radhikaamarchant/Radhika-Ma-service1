const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// The only place we actually want this is inside the IIFE, right before its return.
// Let's just put it immediately after `const handleConfirmWithdraw = () => { ... }`
// Actually wait! Inside the IIFE, handleConfirmWithdraw is declared, we can just do:
content = content.replace(
  /const handleConfirmWithdraw = \(\) => \{/g,
  'const handleConfirmWithdraw = () => {\n'
);
content = content.replace(
  /setSelectedInvestment\(null\);\n            \}\);\n          \};\n/g,
  'setSelectedInvestment(null);\n            });\n          };\n          if (confirmWithdrawRef) confirmWithdrawRef.current = handleConfirmWithdraw;\n'
);
fs.writeFileSync('src/pages/Investments.tsx', content);

