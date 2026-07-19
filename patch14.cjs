const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Also update styling in the CAP tab fields.
const oldInputClass = 'w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500';
const disabledOldInputClass = 'w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500 disabled:opacity-50';

const newInputClass = 'w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors focus:border-[#4184F3]';
const newDisabledInputClass = 'w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors focus:border-[#4184F3] disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-[#111111]';

content = content.replaceAll(oldInputClass, newInputClass);
content = content.replaceAll(disabledOldInputClass, newDisabledInputClass);

const oldLabelClass = 'text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider';
const newLabelClass = 'text-[12px] text-gray-700 dark:text-[#C4C4C4] block mb-1';
const oldLabelClassFlex = 'text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider flex justify-between';
const newLabelClassFlex = 'text-[12px] text-gray-700 dark:text-[#C4C4C4] flex justify-between mb-1';

content = content.replaceAll(oldLabelClassFlex, newLabelClassFlex);
content = content.replaceAll(oldLabelClass, newLabelClass);

// space-y-1 -> space-y-1.5
// let's do this carefully
content = content.replaceAll('<div className="space-y-1">', '<div className="space-y-1.5">');

// Replaces labels text
content = content.replaceAll('Duration (Months)', 'manage month');
content = content.replaceAll('Expected ROI (%)', 'Roi');
content = content.replaceAll('Business Brokerage (%)', 'BSE Brokrage');
content = content.replaceAll('Investor Brokerage (%)', 'INC Brokrage');

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
