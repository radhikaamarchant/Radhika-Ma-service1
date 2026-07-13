const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const regex = /<div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">\s*<div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">\s*<div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">/g;

code = code.replace(regex, '<div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">');

fs.writeFileSync('src/pages/Investors.tsx', code);
