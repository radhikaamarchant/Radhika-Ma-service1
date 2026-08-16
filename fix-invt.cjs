const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// 1. Remove manual useEffect
code = code.replace(/useEffect\(\(\) => \{\s*const term = searchTerm\.toLowerCase\(\);\s*let visibleCount = 0;\s*document\.querySelectorAll\('\.investment-list-row'\)[\s\S]*?\}, \[searchTerm, groupedInvestments\]\);/, '');

// 2. Restore groupedInvestments activeTab filter and searchMatch
code = code.replace(/const searchMatch = true;/, `const searchMatch = (business?.shortName ? business.shortName.toLowerCase().includes(match) : business?.name.toLowerCase().includes(match)) || investor?.name.toLowerCase().includes(match);`);
code = code.replace(/\[allGroupedInvestments, state\.businesses, state\.investors, activeTab\]/, `[allGroupedInvestments, state.businesses, state.investors, activeTab, searchTerm]`);

// 3. Remove DOM attributes from the row
code = code.replace(/className="investment-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group"\n\s*data-search-key=\{.*?\}\n\s*style=\{\{ contentVisibility: 'auto', containIntrinsicSize: '60px' \}\}/g, `className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"`);

// 4. Restore "No investments found"
code = code.replace(/<div id="no-investments-found" style=\{\{ display: 'none' \}\} className="p-8 text-center text-kite-text-light font-normal text-\[13px\] md:text-\[14px\]">No investments found\.<\/div>/g, `{groupedInvestments.length === 0 && (
  <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">
    No investments found.
  </div>
)}`);

fs.writeFileSync('src/pages/Investments.tsx', code);
