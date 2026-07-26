const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const regex = /\{\/\* Kite Style Top Summary Card - Full Width on Mobile \*\/\}\s*<div className="bg-\[#ececed\] dark:bg-\[#1a1a1a\] pb-0 pt-4 px-4">/g;

const replacement = `{/* Kite Style Top Summary Card - Full Width on Mobile */}
                          <div className="relative bg-white dark:bg-black pt-4 pb-2 px-4">
                            <div className="absolute top-0 left-0 right-0 h-[106px] bg-[#ececed] dark:bg-[#1a1a1a] z-0"></div>`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Replaced background!");
} else {
  console.log("Regex not found.");
}
