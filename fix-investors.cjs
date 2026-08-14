const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// 1. Remove filteredInvestors logic entirely, point directly to investorsWithStats
code = code.replace(
  /const filteredInvestors = useMemo\(\(\) => \{[\s\S]*?\}, \[investorsWithStats, deferredSearchTerm\]\);/,
  `const filteredInvestors = investorsWithStats;`
);

// 2. Add useEffect for vanilla filtering
const effectStr = `
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll('.investor-list-row').forEach((node) => {
      const key = node.getAttribute('data-search-key') || '';
      if (key.includes(term)) {
        node.style.display = '';
        visibleCount++;
      } else {
        node.style.display = 'none';
      }
    });
    const noResults = document.getElementById('no-investors-found');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? '' : 'none';
    }
  }, [searchTerm, investorsWithStats]);
`;

code = code.replace('const generateInvestorId = () => {', effectStr + '\n  const generateInvestorId = () => {');

// 3. Inject data-search-key and investor-list-row class, and content-visibility style
code = code.replace(
  /className="flex flex-col bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] hover:bg-gray-50 dark:md:hover:bg-\[\#131415\] cursor-pointer transition-colors min-h-\[50px\] group"/,
  `className="investor-list-row flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] hover:bg-gray-50 dark:md:hover:bg-[#131415] cursor-pointer transition-colors min-h-[50px] group"
                          data-search-key={\`\${investor.name} \${investor.investorId}\`.toLowerCase()}
                          style={{ contentVisibility: 'auto', containIntrinsicSize: '60px' }}`
);

// 4. Update the "No investors found" element
code = code.replace(
  /\{filteredInvestors\.length === 0 &&[\s\S]*?No investors found\.[\s\S]*?\}/,
  `<div id="no-investors-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No investors found.</div>`
);

fs.writeFileSync('src/pages/Investors.tsx', code);
