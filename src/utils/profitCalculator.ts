import { Investment, GlobalSettings } from '../types';
import { calculateFinancials } from './bankBalance';

export function calculateLiveProfit(
  investments: Investment[],
  businessId: string,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null = null
) {
  const financials = calculateFinancials(investments, businessId, marketTrends, settings);

  return {
    investedAmount: financials.capitalInvested,
    liveTrendPercentage: marketTrends[businessId] || 0,
    liveProfit: financials.profitBooked,
    currentValue: financials.currentValue,
    activeInvestments: financials.activeInvestments,
    commissionTax: financials.commissionTax
  };
}

export function calculateHoldingProfit(
  allActiveInvestments: Investment[],
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null = null
) {
  const financials = calculateFinancials(allActiveInvestments, null, marketTrends, settings);
  
  return {
     totalInvested: financials.capitalInvested,
     totalLiveProfit: financials.profitBooked,
     totalCurrentValue: financials.currentValue,
     overallPercentage: financials.capitalInvested > 0 ? (financials.profitBooked / financials.capitalInvested) * 100 : 0
  };
}

