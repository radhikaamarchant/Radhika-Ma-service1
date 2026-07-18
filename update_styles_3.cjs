const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Update header strip padding
code = code.replace(
    'px-4 py-2.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar shadow-sm',
    'px-4 py-1.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar shadow-sm'
);

// Search input
code = code.replace(
    'className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-[#44546A] rounded-[4px] text-[14px] text-gray-900 dark:text-[#F1F5F9] outline-none focus:border-[#4184F3] focus:ring-1 focus:ring-[#4184F3]/20 transition-all"',
    'className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-[#44546A] rounded-[4px] text-[14px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none focus:border-[#4184F3] focus:ring-1 focus:ring-[#4184F3]/20 transition-all"'
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
