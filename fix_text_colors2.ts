import fs from 'fs';

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text-[#444444] with text-kite-text
  content = content.replace(/text-\[#444444\]/g, 'text-kite-text');

  // Replace text-[#9EA1A6] with text-kite-text-light
  content = content.replace(/text-\[#9EA1A6\]/g, 'text-kite-text-light');
  
  // Also fix border-gray-100, etc.
  content = content.replace(/border-gray-100/g, 'border-kite-border-soft');
  content = content.replace(/border-gray-300/g, 'border-kite-border-hard');

  // Fix #1976D2 to kite-blue
  content = content.replace(/text-\[#1976D2\]/g, 'text-kite-blue');
  content = content.replace(/bg-\[#1976D2\]/g, 'bg-kite-blue');
  content = content.replace(/border-\[#1976D2\]/g, 'border-kite-blue');

  // Fix #E8F0FE
  content = content.replace(/bg-\[#E8F0FE\]/g, 'bg-kite-blue/10 dark:bg-kite-blue/20');
  
  fs.writeFileSync(filePath, content);
}

replaceColors('src/components/BusinessDetail.tsx');
replaceColors('src/components/InvestorDetail.tsx');
replaceColors('src/pages/Investors.tsx');
