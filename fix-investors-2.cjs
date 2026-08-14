const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// 1. Add deferredSearchTerm
code = code.replace(
  'const uniqueInvestors = useMemo(() => Array.from(',
  'const deferredSearchTerm = useDeferredValue(searchTerm);\n  const uniqueInvestors = useMemo(() => Array.from('
);

// 2. Split the filteredInvestors
const regex = /const filteredInvestors = useMemo\(\(\) => uniqueInvestors[\s\S]*?\.filter\([\s\S]*?\([\s\S]*?\)\s*\[uniqueInvestors, searchTerm, state\.investments, state\.businesses, state\.settings, marketState\.trends\]\);/;

const replacement = `const investorsWithStats = useMemo(() => uniqueInvestors
    .map((i) => {
      const activeInvs = state.investments.filter(
        (inv) => inv.investorId === i.id && inv.status !== "completed",
      );
      let totalAmountInvested = activeInvs.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );
      if (i.id === "admin_investor") {
        totalAmountInvested = getUnifiedBankBalance(
          "Radhika M",
          state.businesses,
          state.investors,
          state.investments,
          state.settings,
        );
      }
      let totalLiveProfit = 0;
      const grouped = activeInvs.reduce(
        (acc, inv) => {
          if (!acc[inv.businessId]) acc[inv.businessId] = [];
          acc[inv.businessId].push(inv);
          return acc;
        },
        {} as Record<string, Investment[]>,
      );
      Object.entries(grouped).forEach(([bizId, invs]) => {
        const res = calculateLiveProfit(
          invs as Investment[],
          bizId,
          marketState.trends,
          state.settings,
          state.businesses
        );
        totalLiveProfit += res.liveProfit;
      });
      const returnPercentage =
        totalAmountInvested > 0
          ? (totalLiveProfit / totalAmountInvested) * 100
          : 0;
      const hasActive = activeInvs.length > 0;
      const hasCompleted = state.investments.some(
        (inv) => inv.investorId === i.id && inv.status === "completed",
      );
      const status = hasActive
        ? "active"
        : hasCompleted
          ? "withdrawn"
          : "pending";
      return {
        ...i,
        totalInvested: totalAmountInvested,
        totalLiveProfit,
        returnPercentage,
        status,
      };
    })
    .sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    ), [uniqueInvestors, state.investments, state.businesses, state.settings, marketState.trends]);

  const filteredInvestors = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return investorsWithStats.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(term) ||
        i.investorId.includes(term)
    );
  }, [investorsWithStats, deferredSearchTerm]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/Investors.tsx', code);
