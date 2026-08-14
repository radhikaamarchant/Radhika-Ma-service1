const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// 1. Remove filtering from renderedSearchList
code = code.replace(
  /filter\(\(b\) =>[\s\S]*?b\.ownerName\.toLowerCase\(\)\.includes\(deferredSearchTerm\.toLowerCase\(\)\)[\s\S]*?\)\./,
  ``
);

code = code.replace(
  /\[businessesWithStats, deferredSearchTerm, isDesktop, onNavigate, state\.investments, premiumBusiness\]/,
  `[businessesWithStats, isDesktop, onNavigate, state.investments, premiumBusiness]`
);

// 2. Add useEffect for vanilla filtering
const effectStr = `
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('.data-list-row').forEach((node) => {
      const key = node.getAttribute('data-search-key') || '';
      if (key.includes(term)) {
        node.style.display = '';
      } else {
        node.style.display = 'none';
      }
    });
  }, [searchTerm, businessesWithStats]);
`;

code = code.replace('const renderedSearchList = useMemo(() => {', effectStr + '\n  const renderedSearchList = useMemo(() => {');

// 3. Inject data-search-key and data-list-row class, and content-visibility style
code = code.replace(
  /className="bg-white dark:bg-kite-bg dark:md:bg-\[\#181818\] border-b border-kite-border\/40 py-\[12px\] px-4 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800\/50 transition-colors cursor-pointer"/,
  `className="data-list-row bg-white dark:bg-kite-bg dark:md:bg-[#181818] border-b border-kite-border/40 py-[12px] px-4 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer"
          data-search-key={\`\${b.name} \${b.ownerName}\`.toLowerCase()}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '60px' }}`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
