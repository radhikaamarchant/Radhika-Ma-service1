const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const oldFooter = `            {(() => {
            const totalInvested = groupedInvestments.reduce(
              (sum, inv) => sum + inv.amount,
              0
            );
            const totalLiveProfit = groupedInvestments.reduce((sum, inv) => {
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
            const totalPnlPercentage =
            totalInvested > 0 ? totalLiveProfit / totalInvested * 100 : 0;
            const isTotalProfit = totalLiveProfit >= 0;
            return (
              <div className="flex items-center gap-2">`;

const newFooter = `            {(() => {
            return (
              <div className="flex items-center gap-2">`;

code = code.replace(oldFooter, newFooter);

// Now we need to insert the useMemo for totalInvested and totalLiveProfit
// Let's insert it right before the return statement of Investments component.

const returnRegex = /return \(\s*<div className="w-full flex flex-col font-sans/;

const useMemoInsertion = `  const { totalInvested, totalLiveProfit, totalPnlPercentage, isTotalProfit } = useMemo(() => {
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

  return (
    <div className="w-full flex flex-col font-sans`;

code = code.replace(returnRegex, useMemoInsertion);

fs.writeFileSync('src/pages/Investments.tsx', code);
