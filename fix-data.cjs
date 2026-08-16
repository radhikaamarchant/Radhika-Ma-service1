const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// 1. Remove manual useEffect
code = code.replace(/useEffect\(\(\) => \{\s*const term = searchTerm\.toLowerCase\(\);\s*document\.querySelectorAll\('\.data-list-row'\)[\s\S]*?\}, \[searchTerm, businessesWithStats\]\);/, '');

// 2. Restore filter for topInvested
code = code.replace(/const topInvested = isDesktop \?\n  \[\.\.\.businessesWithStats\]\.\n  filter\(\(b\) =>\n    b\.name\.toLowerCase\(\)\.includes\(deferredSearchTerm\.toLowerCase\(\)\) \|\|\n    b\.ownerName\.toLowerCase\(\)\.includes\(deferredSearchTerm\.toLowerCase\(\)\)\n  \)\./, 
  `const topInvested = isDesktop ?\n  [...businessesWithStats].\n  filter((b) =>\n    b.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||\n    b.ownerName.toLowerCase().includes(deferredSearchTerm.toLowerCase())\n  ).`);

// 3. Remove DOM attributes from the row
code = code.replace(/className="data-list-row bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] border-b border-kite-border\/40 py-\[12px\] px-4 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800\/50 transition-colors cursor-pointer"\n\s*data-search-key=\{.*?\}\n\s*style=\{\{ contentVisibility: 'auto', containIntrinsicSize: '60px' \}\}/g, `className="bg-white dark:bg-kite-bg dark:md:bg-[#181818] border-b border-kite-border/40 py-[12px] px-4 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer"`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
