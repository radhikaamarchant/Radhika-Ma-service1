const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
code = code.replace(/pb-12 md:pb-0/g, 'pb-0 md:pb-0');
code = code.replace(/relative pb-10/g, 'relative pb-0');
code = code.replace(/mt-2 pb-10/g, 'mt-2 pb-0');
fs.writeFileSync('src/pages/AdminPage.tsx', code);
