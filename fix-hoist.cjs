const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const useMemoBlock = `  const { totalInvested, totalLiveProfit, totalPnlPercentage, isTotalProfit } = useMemo(() => {
    const totalInv = groupedInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalProf = groupedInvestments.reduce((sum, inv) => {
      const isCompleted = inv.status === "completed";
      if (isCompleted) {
        return (
          sum + (
          inv.payoutDetails ?
          inv.payoutDetails.totalCredited + (
          inv.payoutDetails.rmasCommission || 0) + (
          inv.payoutDetails.happyIncomeTax || 0) -
          inv.amount :
          0));
      }
      return (
        sum +
        globalCalculateLiveProfit(
          [inv],
          inv.businessId,
          marketState.trends,
          state.settings
        ).liveProfit);
    }, 0);
    const totalPct = totalInv > 0 ? (totalProf / totalInv) * 100 : 0;
    return {
      totalInvested: totalInv,
      totalLiveProfit: totalProf,
      totalPnlPercentage: totalPct,
      isTotalProfit: totalProf >= 0
    };
  }, [groupedInvestments, marketState.trends, state.settings]);
`;

code = code.replace(useMemoBlock, '');
code = code.replace('  const renderedList = useMemo(() => {', useMemoBlock + '\n  const renderedList = useMemo(() => {');

fs.writeFileSync('src/pages/Investments.tsx', code);
