import { Investment, Business, Investor, GlobalSettings } from '../types';

export function calculateFinancials(
  investments: Investment[],
  businessId: string | null,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null
) {
  const activeInvestments = investments.filter(inv => 
    inv.status === 'active' && (businessId ? inv.businessId === businessId : true)
  );

  const capitalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
  let profitBooked = 0;
  activeInvestments.forEach(inv => {
    const trend = marketTrends[inv.businessId] || 0;
    profitBooked += inv.amount * (trend / 100);
  });

  let commissionTax = 0;
  let rmasCommissionBusiness = 0;
  let rmasCommissionInvestor = 0;
  
  const bCommPercentage = settings?.businessCommission ?? 5;
  const iCommPercentage = settings?.investorCommission ?? 1;

  if (profitBooked > 0) {
    rmasCommissionBusiness = profitBooked * (bCommPercentage / 100);
    rmasCommissionInvestor = profitBooked * (iCommPercentage / 100);
    commissionTax = rmasCommissionBusiness + rmasCommissionInvestor;
  }

  const currentValue = capitalInvested + profitBooked - commissionTax;

  return {
    capitalInvested,
    profitBooked,
    commissionTax,
    rmasCommissionBusiness,
    rmasCommissionInvestor,
    currentValue,
    activeInvestments
  };
}

export function getUnifiedBankBalance(
  adminName: string,
  businesses: Business[],
  investors: Investor[],
  investments: Investment[],
  settings?: GlobalSettings | null
) {
  let totalCommissions = 0;
  // Calculate historical commissions from completed investments
  investments.forEach(inv => {
    if (inv.status === 'completed' && inv.payoutDetails) {
      totalCommissions += inv.payoutDetails.rmasCommission;
    } else if (inv.status === 'active') {
      const bCommPercentage = settings?.businessCommission ?? 5;
      const iCommPercentage = settings?.investorCommission ?? 1;
      const profit = inv.amount * (inv.interestRate / 100); // this is a simple fallback if live trend is not passed
      if (profit > 0) {
        totalCommissions += profit * ((bCommPercentage + iCommPercentage) / 100);
      }
    }
  });
  return totalCommissions;
}

export function getUnifiedTransactions(
  entityName: string,
  businesses: Business[],
  investors: Investor[],
  investments: Investment[]
) {
  const transactions: any[] = [];
  
  if (entityName === 'Radhika M' || entityName.includes('Admin')) {
    investments.forEach(inv => {
      const b = businesses.find(b => b.id === inv.businessId);
      const i = investors.find(i => i.id === inv.investorId);
      if (inv.status === 'completed' && inv.payoutDetails) {
        transactions.push({
          id: `tx_${inv.id}_comm`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: `RMAS Commission Booked`,
          description: `From settlement of ${b?.name} and ${i?.name}`,
          amount: inv.payoutDetails.rmasCommission,
          type: 'CREDIT',
          category: 'commission'
        });
      }
    });
  } else {
    // For specific business or investor
    const isBusiness = businesses.some(b => b.ownerName === entityName || b.name === entityName);
    const biz = businesses.find(b => b.ownerName === entityName || b.name === entityName);
    const inv = investors.find(i => i.name === entityName);
    
    if (biz) {
      const bizInvs = investments.filter(i => i.businessId === biz.id);
      bizInvs.forEach(i => {
        const investor = investors.find(inv => inv.id === i.investorId);
        transactions.push({
          id: `tx_${i.id}_recv`,
          date: i.startDate,
          title: `Capital Received`,
          description: `From ${investor?.name}`,
          amount: i.amount,
          type: 'CREDIT',
          category: 'capital'
        });
        if (i.status === 'completed' && i.payoutDetails) {
          transactions.push({
            id: `tx_${i.id}_payout`,
            date: i.payoutDetails.payoutDate,
            title: `Settlement Paid`,
            description: `To ${investor?.name}`,
            amount: i.payoutDetails.totalCredited + (i.payoutDetails.rmasCommission || 0) + (i.payoutDetails.happyIncomeTax || 0),
            type: 'DEBIT',
            category: 'settlement'
          });
        }
      });
    } else if (inv) {
      const invInvs = investments.filter(i => i.investorId === inv.id);
      invInvs.forEach(i => {
        const business = businesses.find(b => b.id === i.businessId);
        transactions.push({
          id: `tx_${i.id}_inv`,
          date: i.startDate,
          title: `Investment Made`,
          description: `In ${business?.name}`,
          amount: i.amount,
          type: 'DEBIT',
          category: 'investment'
        });
        if (i.status === 'completed' && i.payoutDetails) {
          transactions.push({
            id: `tx_${i.id}_ret`,
            date: i.payoutDetails.payoutDate,
            title: `Settlement Received`,
            description: `From ${business?.name} (Net)`,
            amount: i.payoutDetails.totalCredited,
            type: 'CREDIT',
            category: 'settlement'
          });
        }
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getUnifiedData(
  businesses: Business[],
  investors: Investor[],
  investments: Investment[],
  settings: GlobalSettings | null,
  marketTrends: Record<string, number>
) {
  // Master logic
  return {
    businesses,
    investors,
    investments
  };
}

