import { Investment, GlobalSettings, Business } from "../types";
import { calculateFinancials } from "./bankBalance";

export function calculateLiveProfit(
  investments: Investment[],
  businessId: string,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null = null,
  businesses: Business[] = []
) {
  const financials = calculateFinancials(
    investments,
    businessId,
    marketTrends,
    settings,
    businesses
  );
  return {
    investedAmount: financials.capitalInvested,
    liveTrendPercentage: financials.capitalInvested > 0 ? (financials.profitBooked / financials.capitalInvested) * 100 : 0,
    liveProfit: financials.profitBooked,
    currentValue: financials.currentValue,
    activeInvestments: financials.activeInvestments,
    commissionTax: financials.commissionTax,
  };
}

export function calculateHoldingProfit(
  allActiveInvestments: Investment[],
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null = null,
  businesses: Business[] = []
) {
  const financials = calculateFinancials(
    allActiveInvestments,
    null,
    marketTrends,
    settings,
    businesses
  );
  return {
    totalInvested: financials.capitalInvested,
    totalLiveProfit: financials.profitBooked,
    totalCurrentValue: financials.currentValue,
    overallPercentage:
      financials.capitalInvested > 0
        ? (financials.profitBooked / financials.capitalInvested) * 100
        : 0,
  };
}
