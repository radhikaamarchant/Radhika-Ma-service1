const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// 1. Remove filteredBusinesses logic entirely, point directly to state.businesses
code = code.replace(
  /const filteredBusinesses = useMemo\(\(\) => \{[\s\S]*?\}, \[state.businesses, deferredSearchTerm\]\);/,
  `const filteredBusinesses = state.businesses;`
);

// 2. Add useEffect for vanilla filtering
const effectStr = `
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll('.business-list-row').forEach((node) => {
      const key = node.getAttribute('data-search-key') || '';
      if (key.includes(term)) {
        node.style.display = '';
        visibleCount++;
      } else {
        node.style.display = 'none';
      }
    });
    const noResults = document.getElementById('no-businesses-found');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? '' : 'none';
    }
  }, [searchTerm, state.businesses]);
`;

code = code.replace('const businessStatsMap = useMemo(() => {', effectStr + '\n  const businessStatsMap = useMemo(() => {');

// 3. Inject data-search-key and business-list-row class, and content-visibility style
// find: `<div\n          key={\`inv_\${business.id}_\${idx}\`}`
code = code.replace(
  /className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group">/,
  `className="business-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"
          data-search-key={\`\${business.name} \${business.ownerName} \${business.businessId}\`.toLowerCase()}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '60px' }}>`
);

// 4. Update the "No businesses found" element
code = code.replace(
  /\{filteredBusinesses.length === 0 && \([\s\S]*?No businesses found.[\s\S]*?\} \)/,
  `<div id="no-businesses-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No businesses found.</div>`
);

// We need to match the specific syntax we have for no businesses found:
// `{filteredBusinesses.length === 0 && (\n                      <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">\n                        No businesses found.\n                      </div>\n                    )} `
// Just string replacement:
code = code.replace(
  '{filteredBusinesses.length === 0 && (\n                      <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">\n                        No businesses found.\n                      </div>\n                    )}',
  `<div id="no-businesses-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No businesses found.</div>`
);

fs.writeFileSync('src/pages/Businesses.tsx', code);
