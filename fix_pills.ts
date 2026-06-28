import fs from 'fs';

function fixPills(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const replaceGreen = 'bg-[#E6F6ED] dark:bg-[#00A86B]/20 text-[#00A86B] dark:text-[#00A86B]';
  const replaceRed = 'bg-[#FCEBEB] dark:bg-[#D94B4B]/20 text-[#D94B4B] dark:text-[#D94B4B]';

  if (content.includes('bg-[#E6F6ED] text-[#00A86B]')) {
    content = content.replace(/bg-\[#E6F6ED\] text-\[#00A86B\]/g, replaceGreen);
    changed = true;
  }
  
  if (content.includes('bg-[#FCEBEB] text-[#D94B4B]')) {
    content = content.replace(/bg-\[#FCEBEB\] text-\[#D94B4B\]/g, replaceRed);
    changed = true;
  }

  if (changed) fs.writeFileSync(filePath, content);
}

fixPills('src/pages/Investments.tsx');
fixPills('src/components/LivePortfolioDetail.tsx');
