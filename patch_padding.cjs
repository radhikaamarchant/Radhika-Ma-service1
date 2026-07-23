const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
codeApp = codeApp.replace('main-content-pb md:pb-0', 'md:pb-0');
codeApp = codeApp.replace('pb-24 md:px-0', 'pb-24 md:px-0'); // ensure it's pb-24
fs.writeFileSync('src/App.tsx', codeApp);

let codeInv = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
codeInv = codeInv.replace('border-kite-border pb-20 md:pb-0', 'border-kite-border pb-0 md:pb-0');
fs.writeFileSync('src/pages/Investors.tsx', codeInv);

let codeBus = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');
codeBus = codeBus.replace('border-kite-border pb-20 md:pb-0', 'border-kite-border pb-0 md:pb-0');
fs.writeFileSync('src/pages/Businesses.tsx', codeBus);

let codeInvm = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
codeInvm = codeInvm.replace('flex-col pb-16', 'flex-col pb-0');
fs.writeFileSync('src/pages/Investments.tsx', codeInvm);
