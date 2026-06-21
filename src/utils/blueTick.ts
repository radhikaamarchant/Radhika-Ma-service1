import { Business, Investment } from '../types';

export const getBlueTickBusinessIds = (businesses: Business[], investments: Investment[]): Set<string> => {
  const businessesWithStats = businesses.map(b => {
    const bizInvs = investments.filter(i => i.businessId === b.id && i.status === 'completed');
    const totalRet = bizInvs.reduce((sum, inv) => {
      const p = inv.payoutDetails;
      return sum + (p ? (p.totalCredited + p.rmasCommission + p.happyIncomeTax) : 0);
    }, 0);
    return { id: b.id, totalRet };
  });

  // Only businesses that have generated some profit are eligible
  // Sort them by highest profit first to find the top performers
  const sorted = businessesWithStats
    .filter(b => b.totalRet > 0)
    .sort((a, b) => b.totalRet - a.totalRet);

  // Take the top 2 highest profitable businesses to ensure exclusivity
  // If everyone gets it, it loses its meaning
  const topIds = sorted.slice(0, 2).map(b => b.id);
  
  return new Set(topIds);
};
