const fs = require('fs');

let content = fs.readFileSync('src/utils/bankBalance.ts', 'utf-8');

const target = `import { Investment, Business, Investor, GlobalSettings } from "../types";
import { getCurrentMarketPrice } from "./marketSimulator";

export function calculateFinancials(
  investments: Investment[],
  businessId: string | null,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null,
) {
  const activeInvestments = investments.filter(
    (inv) =>
      inv.status === "active" &&
      (businessId ? inv.businessId === businessId : true),
  );

  const capitalInvested = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  let profitBooked = 0;
  
  let storedBusinesses = [];
  let storedInvs = [];
  try {
    storedBusinesses = JSON.parse(localStorage.getItem('kite_businesses') || '[]');
    storedInvs = JSON.parse(localStorage.getItem('kite_investments') || '[]');
  } catch(e) {}

  activeInvestments.forEach((inv) => {
    let trend = marketTrends[inv.businessId] || 0;
    
    const b = storedBusinesses.find(bz => bz.id === inv.businessId);
    if (b && b.triggerAmount) {
       const currentPrice = getCurrentMarketPrice(b, storedInvs);
       const originalPrice = b.triggerAmount; 
       if (originalPrice > 0) {
           const absoluteDiff = currentPrice - originalPrice;
           trend = (absoluteDiff / originalPrice) * 100;
       }
    }
    
    profitBooked += inv.amount * (trend / 100);
  });

  let commissionTax = 0;
  let rmasCommissionBusiness = 0;
  let rmasCommissionInvestor = 0;

  const bCommPercentage = settings?.profitCommission?.value ?? 5;
  const iCommPercentage = settings?.investmentCommission?.value ?? 1;

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
    activeInvestments,
  };
}`;

const replacement = `import { Investment, Business, Investor, GlobalSettings } from "../types";

export function calculateFinancials(
  investments: Investment[],
  businessId: string | null,
  marketTrends: Record<string, number>,
  settings: GlobalSettings | null,
) {
  const activeInvestments = investments.filter(
    (inv) =>
      inv.status === "active" &&
      (businessId ? inv.businessId === businessId : true),
  );

  const capitalInvested = activeInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  let profitBooked = 0;
  activeInvestments.forEach((inv) => {
    const trend = marketTrends[inv.businessId] || 0;
    profitBooked += inv.amount * (trend / 100);
  });

  let commissionTax = 0;
  let rmasCommissionBusiness = 0;
  let rmasCommissionInvestor = 0;

  const bCommPercentage = settings?.profitCommission?.value ?? 5;
  const iCommPercentage = settings?.investmentCommission?.value ?? 1;

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
    activeInvestments,
  };
}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/utils/bankBalance.ts', content);
console.log("Fixed bankBalance.ts");
