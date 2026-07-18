const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Update header strip padding
code = code.replace(
    'px-4 py-3.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar shadow-sm',
    'px-4 py-2.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar shadow-sm'
);

// Update dropdown items
code = code.replace(
    '<span className="font-medium text-[13px] text-gray-900 dark:text-[#F1F5F9] uppercase">{i.name}</span>',
    '<span className="font-normal text-[13px] text-[#444444] dark:text-[#F1F5F9] uppercase">{i.name}</span>'
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
