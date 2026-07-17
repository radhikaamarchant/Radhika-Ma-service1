const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(/Market Percentage Settings \(Per Qty\)/g, 'Market Settings (Per Qty)');
code = code.replace(/Increase Market \(\%\)/g, 'Increase Market (₹)');
code = code.replace(/Down Market \(\%\)/g, 'Down Market (₹)');
code = code.replace(/placeholder="e\.g\. 0\.1"/g, 'placeholder="e.g. 2.5"');
code = code.replace(/placeholder="e\.g\. 0\.05"/g, 'placeholder="e.g. 4"');

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
