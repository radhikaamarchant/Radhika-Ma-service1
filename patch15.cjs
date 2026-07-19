const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const regex = /(<div className="grid grid-cols-2 gap-6">\s*<div className="space-y-1\.5">\s*<label className="text-\[12px\] text-gray-700 dark:text-\[#C4C4C4\] block mb-1">\s*manage month\s*<\/label>\s*<input\s*type="number"\s*value=\{formData\.timePeriodMonths\}\s*onChange=\{\(e\) =>\s*setFormData\(\{\s*\.\.\.formData,\s*timePeriodMonths: e\.target\.value,\s*\}\)\s*\}\s*className=")([^"]+)("\s*\/>\s*<\/div>\s*<div className="space-y-1\.5">\s*<label className="text-\[12px\] text-gray-700 dark:text-\[#C4C4C4\] block mb-1">\s*Roi\s*<\/label>\s*<input\s*type="number"\s*value=\{expectedRoi\}\s*onChange=\{\(e\) => setExpectedRoi\(e\.target\.value\)\}\s*disabled=\{orderMode === "SELL"\}\s*className=")([^"]+)("\s*\/>\s*<\/div>\s*<div className="space-y-1\.5">\s*<label className="text-\[12px\] text-gray-700 dark:text-\[#C4C4C4\] flex justify-between mb-1">\s*<span>BSE Brokrage<\/span>.*?<input\s*type="number"\s*step="0\.1"\s*value=\{formData\.adminCommissionBusinessPct\}\s*onChange=\{\(e\) =>\s*setFormData\(\{\s*\.\.\.formData,\s*adminCommissionBusinessPct: e\.target\.value,\s*\}\)\s*\}\s*disabled=\{orderMode === "SELL"\}\s*className=")([^"]+)("\s*\/>\s*<\/div>\s*<div className="space-y-1\.5">\s*<label className="text-\[12px\] text-gray-700 dark:text-\[#C4C4C4\] flex justify-between mb-1">\s*<span>INC Brokrage<\/span>.*?<input\s*type="number"\s*step="0\.1"\s*value=\{formData\.adminCommissionInvestorPct\}\s*onChange=\{\(e\) =>\s*setFormData\(\{\s*\.\.\.formData,\s*adminCommissionInvestorPct: e\.target\.value,\s*\}\)\s*\}\s*disabled=\{orderMode === "SELL"\}\s*className=")([^"]+)("\s*\/>\s*<\/div>\s*<\/div>)/s;

const match = content.match(regex);
if (match) {
  let replaced = match[0];
  const normalClass = 'w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors focus:border-[#4184F3]';
  const disabledClass = 'w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors focus:border-[#4184F3] disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-[#111111]';
  
  replaced = replaced.replace(match[2], normalClass);
  replaced = replaced.replace(match[4], disabledClass);
  replaced = replaced.replace(match[6], disabledClass);
  replaced = replaced.replace(match[8], disabledClass);
  
  content = content.replace(match[0], replaced);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
  console.log('CAP tab fields replaced.');
} else {
  console.log('Regex did not match.');
}
