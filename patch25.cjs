const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');
const oldStr = `className="md:hidden absolute left-0 right-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 transition-all duration-100 ease-out"`;
const newStr = `className="md:hidden fixed left-0 right-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 transition-all duration-100 ease-out"`;
if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Patched to fixed");
} else {
  console.log("Could not find string");
}
