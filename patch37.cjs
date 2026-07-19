const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `<div className="overflow-y-auto flex-1 hide-scrollbar">`;
const newStr = `<div className="overflow-y-auto flex-1 hide-scrollbar pb-32">`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched business list padding");
} else {
  console.log("Could not find string");
}
