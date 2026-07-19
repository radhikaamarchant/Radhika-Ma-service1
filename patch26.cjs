const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr1 = `className="absolute top-full left-0 right-0 z-[100] overflow-hidden bg-gray-50 dark:bg-[#2B3648] border-b border-x border-gray-200 dark:border-[#44546A] shadow-2xl rounded-b-[8px] origin-top"`;
const newStr1 = `className="absolute top-full left-0 right-0 z-[100] overflow-hidden bg-gray-50 dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] origin-top"`;

const oldStr2 = `<div className="max-h-[250px] overflow-y-auto hide-scrollbar pb-8">`;
const newStr2 = `<div className="overflow-y-auto hide-scrollbar pb-8" style={{ height: 'calc(100dvh - 340px)' }}>`;

if (content.includes(oldStr1) && content.includes(oldStr2)) {
  content = content.replace(oldStr1, newStr1);
  content = content.replace(oldStr2, newStr2);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched dropdown");
} else {
  console.log("Could not find string");
}
