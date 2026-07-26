const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// The wrapper for the summary card:
// Currently it is `<div className="bg-[#ececed] dark:bg-[#1a1a1a] pb-3 pt-2 px-4">`
// We need to change it to pb-0
content = content.replace(
  /<div className="bg-\[#ececed\] dark:bg-\[#1a1a1a\] pb-3 pt-2 px-4">/g,
  `<div className="bg-[#ececed] dark:bg-[#1a1a1a] pb-0 pt-4 px-4">`
);

// We need to restore the shadow and rounded-lg on the card:
// Currently it is `<div className="bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-300 dark:border-gray-700 shadow-none p-4">`
content = content.replace(
  /<div className="bg-white dark:bg-\[#2a2a2a\] rounded-lg border border-gray-300 dark:border-gray-700 shadow-none p-4">/g,
  `<div className="bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-4 relative z-10">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed final grey stripe.");
