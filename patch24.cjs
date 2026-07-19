const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `<div className="max-[250px] overflow-y-auto hide-scrollbar pb-16">`;
const newStr = `<div className="max-h-[250px] overflow-y-auto hide-scrollbar pb-8">`;

if (content.includes(oldStr)) {
   content = content.replace(oldStr, newStr);
   fs.writeFileSync('src/pages/Investments.tsx', content);
   console.log("Patched investor dropdown max height properly!");
} else {
   console.log("Could not find dropdown");
}
