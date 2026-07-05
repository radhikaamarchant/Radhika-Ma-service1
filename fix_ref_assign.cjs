const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// Remove from inside handleConfirmWithdraw
content = content.replace(
  /const handleConfirmWithdraw = \(\) => \{\n  confirmWithdrawRef\.current = handleConfirmWithdraw;\n/,
  'const handleConfirmWithdraw = () => {\n'
);

// Add it right after handleConfirmWithdraw is declared (wait, the function is big, let's just insert it right after the declaration starts but outside it? No, if we put it right before the return statement inside the IIFE, it will run during render. Let's just put it inside the IIFE right before the `return (` statement.

content = content.replace(
  /\n            return \(/g,
  '\n            if (confirmWithdrawRef) confirmWithdrawRef.current = handleConfirmWithdraw;\n            return ('
);

fs.writeFileSync('src/pages/Investments.tsx', content);

