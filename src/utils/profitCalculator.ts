import { Investment, Business } from '../types';

export function calculateLiveProfit(
  investments: Investment[],
  businessId: string,
  marketTrends: Record<string, number>
) {
  const activeInvestments = investments.filter(
    (inv) => inv.businessId === businessId && inv.status === 'active'
  );

  const investedAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const liveTrendPercentage = marketTrends[businessId] || 0;
  
  const liveProfit = investedAmount * (liveTrendPercentage / 100);
  const currentValue = investedAmount + liveProfit;

  return {
    investedAmount,
    liveTrendPercentage,
    liveProfit,
    currentValue,
    activeInvestments
  };
}

export function calculateHoldingProfit(
  allActiveInvestments: Investment[],
  marketTrends: Record<string, number>
) {
  let totalInvested = 0;
  let totalLiveProfit = 0;

  allActiveInvestments.forEach(inv => {
     if(inv.status !== 'active') return;
     const trend = marketTrends[inv.businessId] || 0;
     const profit = inv.amount * (trend / 100);
     totalInvested += inv.amount;
     totalLiveProfit += profit;
  });
  
  return {
     totalInvested,
     totalLiveProfit,
     totalCurrentValue: totalInvested + totalLiveProfit,
     overallPercentage: totalInvested > 0 ? (totalLiveProfit / totalInvested) * 100 : 0
  };
}
