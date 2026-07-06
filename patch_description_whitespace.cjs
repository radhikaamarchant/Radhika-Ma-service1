const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const targetStr = '<span className="text-kite-text text-[14px] font-medium mt-0.5">{business.description || "No description provided for this business owner."}</span>';
const newStr = '<span className="text-kite-text text-[14px] font-medium mt-0.5 whitespace-pre-wrap">{business.description || "No description provided for this business owner."}</span>';

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched whitespace-pre-wrap");
