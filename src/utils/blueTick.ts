import { Business, Investment } from '../types';

export interface VerificationStats {
  isBlueTick: boolean;
  isPreVerified: boolean;
  profitPct: number;
  progressToBlueTick: number; // percentage of progress (0 to 1) based on 60% goal
  profitPctDisplay: number; // e.g. 45.5 for 45.5%
}

export const getVerificationStats = (businesses: Business[], investments: Investment[]): Map<string, VerificationStats> => {
  const statsMap = new Map<string, VerificationStats>();
  
  // Group investments by business and by owner
  const businessStats = new Map<string, { totalInvested: number, totalProfit: number, uniqueInvestors: Set<string> }>();
  const ownerStats = new Map<string, { totalInvested: number, totalProfit: number }>();
  
  // Initialize maps
  businesses.forEach(b => {
    businessStats.set(b.id, { totalInvested: 0, totalProfit: 0, uniqueInvestors: new Set() });
    if (!ownerStats.has(b.ownerName)) {
      ownerStats.set(b.ownerName, { totalInvested: 0, totalProfit: 0 });
    }
  });

  investments.forEach(inv => {
    if (inv.status === 'completed' && inv.payoutDetails) {
      const b = businesses.find(bz => bz.id === inv.businessId);
      if (b) {
        const p = inv.payoutDetails;
        const totalReturn = p.totalCredited + p.rmasCommission + p.happyIncomeTax;
        const profit = totalReturn - inv.amount;
        
        // Skip investments that are withdrawals (profit <= 0 gives back the principal but doesn't contribute to business track record)
        if (profit > 0) {
          const bStat = businessStats.get(b.id)!;
          bStat.totalInvested += inv.amount;
          bStat.totalProfit += profit;
          bStat.uniqueInvestors.add(inv.investorId);
          
          const oStat = ownerStats.get(b.ownerName)!;
          oStat.totalInvested += inv.amount;
          oStat.totalProfit += profit;
        }
      }
    }
  });

  // Evaluate conditions
  businesses.forEach(b => {
    const bStat = businessStats.get(b.id)!;
    const oStat = ownerStats.get(b.ownerName)!;
    
    // Condition 1: Total profit delivered to investors must be 60% or more
    const businessProfitPct = bStat.totalInvested > 0 ? (bStat.totalProfit / bStat.totalInvested) : 0;
    // Condition 2: Total number of unique investors >= 20
    const businessQualifies = businessProfitPct >= 0.60 && bStat.uniqueInvestors.size >= 20;
    
    const isBlueTick = businessQualifies;
    const isPreVerified = !isBlueTick && businessProfitPct >= 0.30 && businessProfitPct < 0.60;
    
    // Progress calculation towards the 60% mark
    // If profit is 30%, progress is 30/60 = 0.5
    const progressToBlueTick = Math.min(Math.max(businessProfitPct / 0.60, 0), 1);
    
    statsMap.set(b.id, {
      isBlueTick,
      isPreVerified,
      profitPct: businessProfitPct,
      progressToBlueTick,
      profitPctDisplay: businessProfitPct * 100,
    });
  });

  return statsMap;
};

export const getBlueTickBusinessIds = (businesses: Business[], investments: Investment[]): Set<string> => {
  const statsMap = getVerificationStats(businesses, investments);
  const blueTickBusinessIds = new Set<string>();
  
  for (const [id, stats] of Array.from(statsMap.entries())) {
    if (stats.isBlueTick) {
      blueTickBusinessIds.add(id);
    }
  }

  return blueTickBusinessIds;
};
