import fs from 'fs';

const code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `  const businessesWithStats = state.businesses.map((b) => {
    const overallTrend = marketState.trends[b.id] ?? b.interestRate;
    const bizInvs = state.investments.filter((i) => i.businessId === b.id);
    const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const liveTotalValue = bizInvs.reduce((sum, inv) => {
      if (inv.status ==="active") {
        const { currentValue } = calculateLiveProfit(
          [inv],
          b.id,
          marketState.trends,
          state.settings,
        );
        return sum + currentValue;
      }
      return sum + inv.amount;
    }, 0);`;

const replacementStr = `  const businessesWithStats = state.businesses.map((b) => {
    const overallTrend = marketState.trends[b.id] ?? b.interestRate;
    const bizInvs = state.investments.filter((i) => i.businessId === b.id);
    const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const liveTotalValue = bizInvs.reduce((sum, inv) => {
      if (inv.status ==="active") {
        const { currentValue } = calculateLiveProfit(
          [inv],
          b.id,
          marketState.trends,
          state.settings,
        );
        return sum + currentValue;
      }
      return sum + inv.amount;
    }, 0);
    const activeInvs = bizInvs.filter((i) => i.status === "active");
    const activeTotalInv = activeInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const activeLiveTotalValue = activeInvs.reduce((sum, inv) => {
      const { currentValue } = calculateLiveProfit(
        [inv],
        b.id,
        marketState.trends,
        state.settings,
      );
      return sum + currentValue;
    }, 0);`;

if (code.includes(targetStr)) {
  const updatedCode = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/DataAnalysis.tsx', updatedCode);
  console.log("Success 1");
} else {
  console.log("Target string 1 not found!");
}
