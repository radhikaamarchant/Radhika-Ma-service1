const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetTextarea = /'border-kite-border-hard py-1\.5 resize-none h-16'/;
const newTextarea = /'border-kite-border-hard py-1\.5 resize-none h-16 overflow-hidden'/;

if (!content.includes("'border-kite-border-hard py-1.5 resize-none h-16 overflow-hidden'")) {
  content = content.replace(targetTextarea, "'border-kite-border-hard py-1.5 resize-none h-16 overflow-hidden'");
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched description overflow hidden");
}

