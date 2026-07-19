const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `<div className="overflow-y-auto hide-scrollbar pb-8" style={{ height: 'calc(100dvh - 340px)' }}>`;
const newStr = `<div className="overflow-y-auto hide-scrollbar pb-2" style={{ height: 'calc(100dvh - 390px)' }}>`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched list height");
} else {
  console.log("Could not find string");
}
