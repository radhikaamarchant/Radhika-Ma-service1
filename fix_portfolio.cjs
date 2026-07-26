const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Fix 1: Top padding
const oldHeader = `<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-none md:border-none">`;
const newHeader = `<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(32px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none">`;
content = content.replace(oldHeader, newHeader);

// Fix 2: Bottom bar position
const oldBar = `<div className="fixed bottom-[56px] left-0 w-full z-[100] bg-white dark:bg-[#2b414f] border-t border-gray-200 dark:border-[#2b414f] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 h-[54px] flex justify-between items-center md:hidden">`;
const newBar = `<div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 w-full z-[100] bg-white dark:bg-[#2b414f] border-t border-gray-200 dark:border-[#2b414f] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 h-[54px] flex justify-between items-center md:hidden">`;
content = content.replace(oldBar, newBar);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed portfolio top padding and bottom P&L bar");
