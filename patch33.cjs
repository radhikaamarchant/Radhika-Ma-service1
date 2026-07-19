const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr2 = `<div className="overflow-y-auto hide-scrollbar pb-2" style={{ maxHeight: 'calc(100dvh - 300px)' }}>`;
const newStr2 = `<div className="overflow-y-auto hide-scrollbar pb-2" style={{ maxHeight: keyboardHeight > 0 ? \`\${keyboardHeight - 20}px\` : (viewportHeight ? \`\${viewportHeight - 200}px\` : 'calc(100dvh - 200px)') }}>`;

if (content.includes(oldStr2)) {
  content = content.replace(oldStr2, newStr2);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched list max height");
} else {
  console.log("Could not find string");
}
