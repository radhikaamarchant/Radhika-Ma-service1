const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldHeader = /<div className=\{`h-\[70px\] px-6 flex items-center justify-between transition-colors duration-300 \$\{orderMode === "BUY" \? "bg-\[#4184F3\]" : "bg-\[#FF5722\]"\}`\}>/;
const newHeader = `<div className="h-[70px] px-6 flex items-center justify-between transition-colors duration-300 bg-white dark:bg-[#1B1B1B] border-b border-gray-100 dark:border-[#2A2A2A]/50">`;

content = content.replace(oldHeader, newHeader);

const oldTextContainer = /<div className="flex flex-col text-white">/;
const newTextContainer = `<div className="flex flex-col text-gray-900 dark:text-[#E3E3E3]">`;

content = content.replace(oldTextContainer, newTextContainer);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
