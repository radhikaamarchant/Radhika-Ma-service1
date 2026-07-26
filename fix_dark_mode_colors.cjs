const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// 1. Center Tabs and update Header Background (Header and Tabs)
content = content.replace(
  /<div className="bg-\[#ececed\] md:bg-white dark:bg-\[#1a1a1a\] dark:md:bg-\[#181818\] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-none md:border-none">/g,
  `<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-none md:border-none">`
);

content = content.replace(
  /<div className="flex items-center gap-6">/g,
  `<div className="flex items-center justify-center w-full gap-6">`
);

// 2. Absolute split background
content = content.replace(
  /<div className="absolute top-0 left-0 right-0 h-\[106px\] bg-\[#ececed\] dark:bg-\[#1a1a1a\] z-0"><\/div>/g,
  `<div className="absolute top-0 left-0 right-0 h-[106px] bg-[#ececed] dark:bg-[#1c2a37] z-0"></div>`
);

// 3. Card background
content = content.replace(
  /<div className="bg-white dark:bg-\[#2a2a2a\] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-4 relative z-10">/g,
  `<div className="bg-white dark:bg-[#2b414f] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-4 relative z-10">`
);

// 4. List background
content = content.replace(
  /<div className="bg-white dark:bg-black min-h-screen">/g,
  `<div className="bg-white dark:bg-[#14212b] min-h-screen">`
);

// 5. Sticky Bottom Bar background
content = content.replace(
  /<div className="fixed bottom-\[56px\] left-0 w-full z-\[100\] bg-white dark:bg-\[#1a1a1a\] border-t border-gray-200 dark:border-gray-700 shadow-\[0_-4px_6px_-1px_rgba\(0,0,0,0\.1\)\] px-4 py-3 flex justify-between items-center md:hidden">/g,
  `<div className="fixed bottom-[56px] left-0 w-full z-[100] bg-white dark:bg-[#2b414f] border-t border-gray-200 dark:border-[#2b414f] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 flex justify-between items-center md:hidden">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated dark mode colors for mobile user.");
