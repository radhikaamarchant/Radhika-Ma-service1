const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// 1. Remove the manual useEffect
code = code.replace(/useEffect\(\(\) => \{\s*const term = searchTerm\.toLowerCase\(\);\s*let visibleCount = 0;\s*document\.querySelectorAll\('\.business-list-row'\)[\s\S]*?\}, \[searchTerm, state\.businesses\]\);/, '');

// 2. Restore filteredBusinesses
code = code.replace(/const filteredBusinesses = state\.businesses;/, `const filteredBusinesses = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return state.businesses.filter((b) =>
      (b.name && b.name.toLowerCase().includes(term)) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(term))
    );
  }, [state.businesses, deferredSearchTerm]);`);

// 3. Remove DOM attributes from the row
code = code.replace(/className="business-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group"\n\s*data-search-key=\{.*?\}\n\s*style=\{\{ contentVisibility: 'auto', containIntrinsicSize: '60px' \}\}/g, `className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"`);

// 4. Restore "No businesses found"
code = code.replace(/<div id="no-businesses-found" style=\{\{ display: 'none' \}\} className="p-8 text-center text-kite-text-light font-normal text-\[13px\] md:text-\[14px\]">No businesses found\.<\/div>/g, `{filteredBusinesses.length === 0 && (
  <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">
    No businesses found.
  </div>
)}`);

fs.writeFileSync('src/pages/Businesses.tsx', code);
