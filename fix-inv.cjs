const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// 1. Remove manual useEffect
code = code.replace(/useEffect\(\(\) => \{\s*const term = searchTerm\.toLowerCase\(\);\s*let visibleCount = 0;\s*document\.querySelectorAll\('\.investor-list-row'\)[\s\S]*?\}, \[searchTerm, investorsWithStats\]\);/, '');

// 2. Restore filteredInvestors
code = code.replace(/const filteredInvestors = investorsWithStats;/, `const filteredInvestors = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return investorsWithStats.filter((i) =>
      (i.name || "").toLowerCase().includes(term) ||
      i.investorId.includes(term)
    );
  }, [investorsWithStats, deferredSearchTerm]);`);

// 3. Remove DOM attributes from the row
code = code.replace(/className="investor-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group"\n\s*data-search-key=\{.*?\}\n\s*style=\{\{ contentVisibility: 'auto', containIntrinsicSize: '60px' \}\}/g, `className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"`);

// 4. Restore "No investors found"
code = code.replace(/<div id="no-investors-found" style=\{\{ display: 'none' \}\} className="p-8 text-center text-kite-text-light font-normal text-\[13px\] md:text-\[14px\]">No investors found\.<\/div>/g, `{filteredInvestors.length === 0 && (
  <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">
    No investors found.
  </div>
)}`);

fs.writeFileSync('src/pages/Investors.tsx', code);
