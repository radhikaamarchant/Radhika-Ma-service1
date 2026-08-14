const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

if (!code.includes('useDeferredValue')) {
    code = code.replace('useMemo } from "react";', 'useMemo, useDeferredValue } from "react";');
}

if (!code.includes('const deferredSearchTerm = useDeferredValue(searchTerm);')) {
  code = code.replace(
    'const businessesWithStats = state.businesses.map((b) => {',
    'const deferredSearchTerm = useDeferredValue(searchTerm);\n  const businessesWithStats = useMemo(() => state.businesses.map((b) => {'
  );

  code = code.replace(
    /        : b\.interestRate;\n    return \{\n      \.\.\.b,\n      totalInv,\n      totalRet,\n      investorCount,\n      avgReturnPct,\n      profitedInvestorsCount,\n      activeTotalInv,\n      activeLiveTotalValue,\n      liveTotalValue,\n      overallTrend,\n    \};\n  \}\);\n/g,
    `        : b.interestRate;
    return {
      ...b,
      totalInv,
      totalRet,
      investorCount,
      avgReturnPct,
      profitedInvestorsCount,
      activeTotalInv,
      activeLiveTotalValue,
      liveTotalValue,
      overallTrend,
    };
  }), [state.businesses, state.investments, marketState.trends, state.settings]);
`
  );

  code = code.replace(/searchTerm\.toLowerCase\(\)/g, 'deferredSearchTerm.toLowerCase()');

  fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
}
