const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(/const renderedSearchList = useMemo\(\(\) => \{\n\s*return businessesWithStats\.\n\s*map\(\(b\)/, `const renderedSearchList = useMemo(() => {
    return businessesWithStats.
    filter((b) =>
      b.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(deferredSearchTerm.toLowerCase())
    ).
    map((b)`);

code = code.replace(/\[businessesWithStats, isDesktop, onNavigate, state\.investments, premiumBusiness\]/, `[businessesWithStats, deferredSearchTerm, isDesktop, onNavigate, state.investments, premiumBusiness]`);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
