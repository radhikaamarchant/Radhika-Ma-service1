const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(
    /<tbody className="divide-y divide-kite-border-soft text-\[14px\]">/,
    '<tbody className="divide-y divide-kite-border-soft text-[14px] investor-table-body">'
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);

let cssCode = fs.readFileSync('src/index.css', 'utf8');
if (!cssCode.includes('.investor-table-body')) {
    cssCode += `\n/* Force table body font and padding as requested */\n.investor-table-body td {\n  padding: 10px 12px !important;\n  font-size: 14px !important;\n}\n`;
    fs.writeFileSync('src/index.css', cssCode);
}

console.log("Patched BusinessDetail and index.css");
