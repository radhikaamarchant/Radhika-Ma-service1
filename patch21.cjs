const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const contentOld = `<div className="flex-1 overflow-y-auto pb-[200px] bg-white dark:bg-[#1E2938]">`;
const contentNew = `<div className="flex-1 overflow-y-auto bg-white dark:bg-[#1E2938]" style={{ paddingBottom: \`\${keyboardHeight + 200}px\` }}>`;

if (content.includes(contentOld)) {
   content = content.replace(contentOld, contentNew);
   fs.writeFileSync('src/pages/Investments.tsx', content);
   console.log("Patched content container!");
} else {
   console.log("Could not find content container.");
}
