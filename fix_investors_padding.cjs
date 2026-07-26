const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
  '<div className="sticky top-0 z-30 bg-[#ececed] dark:bg-[#1c2a37] dark:md:bg-[#181818] w-full md:hidden pt-[calc(12px+env(safe-area-inset-top))] px-4 pb-3">',
  '<div className="sticky top-0 z-30 bg-[#ececed] dark:bg-[#1c2a37] dark:md:bg-[#181818] w-full md:hidden pt-3 px-4 pb-3">'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed Investors.tsx padding");
