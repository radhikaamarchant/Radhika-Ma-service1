const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

// 1. Remove the withdrawStep === 0 wrapper at the start of the body
content = content.replace(
  /\{\s*withdrawStep\s*===\s*0\s*&&\s*\(\s*<div\s+className="hidden\s+md:block\s+p-4\s+md:p-6\s+flex-1\s+overflow-y-auto\s+bg-kite-bg">/,
  '<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">'
);

// 2. Remove the closing brace of the wrapper
content = content.replace(
  /<\/>\s*<\/div>\s*\)\}\s*\{withdrawStep\s*===\s*1\s*&&\s*\(/g,
  '</>\n                </div>\n{withdrawStep === 1 && ('
);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Patched LivePortfolioDetail.tsx");
