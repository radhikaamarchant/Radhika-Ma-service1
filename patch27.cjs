const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldStr = `className="absolute top-full left-0 right-0 z-[100] overflow-hidden bg-gray-50 dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] origin-top"`;
const newStr = `className="w-full overflow-hidden bg-[#F3F4F6] dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] origin-top"`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched to inline");
} else {
  console.log("Could not find string");
}
