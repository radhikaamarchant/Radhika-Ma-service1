const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const targetHeaderOld = 'className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(12px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none"';
const targetHeaderNew = 'className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-16 md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none"';

if (content.includes(targetHeaderOld)) {
  content = content.replace(targetHeaderOld, targetHeaderNew);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Padding updated.");
} else {
  console.log("Header not found!");
}
