const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
  /<div className="fixed bottom-\[56px\] left-0 w-full z-\[100\] bg-white dark:bg-\[#1a1a1a\] border-t border-gray-200 dark:border-gray-700 shadow-\[0_-4px_6px_-1px_rgba\(0,0,0,0\.1\)\] px-4 py-3 flex justify-between items-center block md:hidden">/,
  `<div className="fixed bottom-[56px] left-0 w-full z-[100] bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 flex justify-between items-center md:hidden">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Removed conflicting block class");
