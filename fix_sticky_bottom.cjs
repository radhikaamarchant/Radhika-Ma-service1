const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Replace the bottom-0 with bottom-[56px] or bottom-14 for the P&L bar
content = content.replace(
  /<div className="fixed bottom-0 left-0 w-full z-\[100\] bg-white dark:bg-\[#1a1a1a\] border-t border-gray-200 dark:border-gray-700 shadow-\[0_-4px_6px_-1px_rgba\(0,0,0,0\.1\)\] px-4 py-3 flex justify-between items-center block md:hidden">/,
  `<div className="fixed bottom-[56px] left-0 w-full z-[99] bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 flex justify-between items-center block md:hidden">`
);

// Add pb-32 to the container to ensure enough scrolling space
content = content.replace(
  /<div className="block md:hidden pb-24">/,
  `<div className="block md:hidden pb-32">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed sticky bottom positioning");
