const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `<div className="max-h-[60vh] overflow-y-auto hide-scrollbar pb-24">`;
const newStr = `<div className="max-[250px] overflow-y-auto hide-scrollbar pb-16">`;

if (content.includes(oldStr)) {
   content = content.replace(oldStr, newStr);
   fs.writeFileSync('src/pages/Investments.tsx', content);
   console.log("Patched investor dropdown max height!");
} else {
   console.log("Could not find dropdown");
}
