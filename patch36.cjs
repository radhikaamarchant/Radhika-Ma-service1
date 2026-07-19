const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `<div className="overflow-y-auto hide-scrollbar pb-2" style={{ maxHeight: viewportHeight ? \`\${viewportHeight - 160}px\` : 'calc(100dvh - 200px)' }}>`;
const newStr = `<div className="overflow-y-auto hide-scrollbar pb-32" style={{ maxHeight: viewportHeight ? \`\${viewportHeight - 160}px\` : 'calc(100dvh - 200px)' }}>`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched pb-2 to pb-32");
} else {
  console.log("Could not find string");
}
