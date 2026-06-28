import fs from 'fs';

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text-[#444444] with text-kite-text
  content = content.replace(/text-\[#444444\]/g, 'text-kite-text');

  // Replace text-[#9EA1A6] with text-kite-text-light
  content = content.replace(/text-\[#9EA1A6\]/g, 'text-kite-text-light');
  
  // Replace other hardcoded grays that might be causing issues
  content = content.replace(/text-gray-500/g, 'text-kite-text-light');
  content = content.replace(/text-gray-400/g, 'text-kite-text-muted');
  content = content.replace(/text-gray-800/g, 'text-kite-text');
  content = content.replace(/text-gray-900/g, 'text-kite-text');
  content = content.replace(/text-black/g, 'text-kite-text');

  fs.writeFileSync(filePath, content);
}

replaceColors('src/pages/Investments.tsx');
replaceColors('src/pages/Businesses.tsx');
replaceColors('src/components/BusinessSidebar.tsx');
replaceColors('src/components/TopNav.tsx');
replaceColors('src/components/SwipeButton.tsx');
replaceColors('src/components/MobilePortfolioSummary.tsx');
