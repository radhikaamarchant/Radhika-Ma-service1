const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// 1. Import useDeferredValue
if (!code.includes('useDeferredValue')) {
    code = code.replace('useMemo } from "react";', 'useMemo, useDeferredValue } from "react";');
}

// 2. Add deferredSearchTerm
code = code.replace(
    'const isPreVerified = (id) => statsMap.get(id)?.isPreVerified ?? false;',
    'const isPreVerified = (id) => statsMap.get(id)?.isPreVerified ?? false;\n  const deferredSearchTerm = useDeferredValue(searchTerm);'
);

// 3. Fix filteredBusinesses to use deferredSearchTerm and be memoized
code = code.replace(
    /const filteredBusinesses = state\.businesses\.filter\([\s\S]*?\);\n/g,
    `const filteredBusinesses = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return state.businesses.filter((b) =>
      (b.name && b.name.toLowerCase().includes(term)) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(term))
    );
  }, [state.businesses, deferredSearchTerm]);\n`
);

// 4. Precompute business stats OUTSIDE the render mapping!
const precomputeStats = `
  const businessStatsMap = useMemo(() => {
    const map = new Map();
    state.investments.forEach((inv) => {
      if (inv.status === "active") {
        if (!map.has(inv.businessId)) {
          map.set(inv.businessId, { totalInvested: 0, investors: new Set() });
        }
        const s = map.get(inv.businessId);
        s.totalInvested += inv.amount;
        s.investors.add(inv.investorId);
      }
    });
    return map;
  }, [state.investments]);
`;
code = code.replace('const startAddBusiness = () => {', precomputeStats + '\n  const startAddBusiness = () => {');

// 5. Use the precomputed stats inside the map
code = code.replace(
    /const activeInvestments = state\.investments\.filter\([\s\S]*?inv\.status === "active",\n\s*\);\n\s*const totalInvested = activeInvestments\.reduce\([\s\S]*?0,\n\s*\);\n\s*const uniqueInvestorsCount = new Set\(activeInvestments\.map\(inv => inv\.investorId\)\)\.size;/g,
    `const bStats = businessStatsMap.get(business.id) || { totalInvested: 0, investors: new Set() };
                      const totalInvested = bStats.totalInvested;
                      const uniqueInvestorsCount = bStats.investors.size;`
);

fs.writeFileSync('src/pages/Businesses.tsx', code);
