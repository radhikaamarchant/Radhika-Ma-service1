const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// 1. Update the filter for groupedInvestments to only use activeTab
code = code.replace(
  /const searchMatch =[\s\S]*?investor\?\.name\.toLowerCase\(\)\.includes\(match\);/,
  `const searchMatch = true;`
);

// We should also remove searchTerm from the dependency array of groupedInvestments
code = code.replace(
  /\[allGroupedInvestments, state\.businesses, state\.investors, searchTerm, activeTab\]/,
  `[allGroupedInvestments, state.businesses, state.investors, activeTab]`
);

// 2. Add useEffect for vanilla filtering
const effectStr = `
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll('.investment-list-row').forEach((node) => {
      const key = node.getAttribute('data-search-key') || '';
      if (key.includes(term)) {
        node.style.display = '';
        visibleCount++;
      } else {
        node.style.display = 'none';
      }
    });
    const noResults = document.getElementById('no-investments-found');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? '' : 'none';
    }
  }, [searchTerm, groupedInvestments]);
`;

code = code.replace('const activeBusinesses = useMemo', effectStr + '\n  const activeBusinesses = useMemo');

// 3. Inject data-search-key and investment-list-row class, and content-visibility style
code = code.replace(
  /className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group"/,
  `className="investment-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"
                data-search-key={\`\${business?.name || ''} \${business?.shortName || ''} \${investor?.name || ''}\`.toLowerCase()}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '60px' }}`
);

// 4. Update the "No investments found" element
code = code.replace(
  /\{groupedInvestments\.length === 0 &&[\s\S]*?No investments found\.[\s\S]*?\}/,
  `<div id="no-investments-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No investments found.</div>`
);

fs.writeFileSync('src/pages/Investments.tsx', code);
