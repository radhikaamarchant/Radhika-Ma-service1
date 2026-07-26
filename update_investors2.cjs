const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Replace py-3 with h-[54px]
const oldBar = `<div className="fixed bottom-[56px] left-0 w-full z-[100] bg-white dark:bg-[#2b414f] border-t border-gray-200 dark:border-[#2b414f] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 flex justify-between items-center md:hidden">`;
const newBar = `<div className="fixed bottom-[56px] left-0 w-full z-[100] bg-white dark:bg-[#2b414f] border-t border-gray-200 dark:border-[#2b414f] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 h-[54px] flex justify-between items-center md:hidden">`;

content = content.replace(oldBar, newBar);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated bottom bar height");
