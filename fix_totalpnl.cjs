const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
content = content.replace(/Total P&L\n                            <\/p>/g, `Total P&L (₹)\n                            </p>`);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed Total P&L in mobile view");
