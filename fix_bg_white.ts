import fs from 'fs';

function fixBgWhite(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace bg-white dark:bg-kite-surface with just bg-kite-surface
  content = content.replace(/bg-white dark:bg-kite-surface/g, 'bg-kite-surface');
  // Replace bg-white dark:bg-transparent with bg-kite-surface dark:bg-transparent
  content = content.replace(/bg-white dark:bg-transparent/g, 'bg-kite-surface dark:bg-transparent');
  // Replace bg-white dark:bg-kite-bg with bg-kite-bg
  content = content.replace(/bg-white dark:bg-kite-bg/g, 'bg-kite-bg');

  fs.writeFileSync(filePath, content);
}

const files = [
  'src/pages/Investments.tsx',
  'src/pages/Investors.tsx',
  'src/pages/Businesses.tsx',
  'src/components/MobilePortfolioSummary.tsx',
  'src/components/TopNav.tsx',
  'src/components/Sidebar.tsx',
  'src/components/BusinessSidebar.tsx',
  'src/components/BusinessDetail.tsx',
  'src/components/InvestorDetail.tsx'
];

files.forEach(fixBgWhite);
