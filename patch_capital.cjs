const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Add calculateSellStats function
const sellStatsFunc = `
  const calculateSellStats = () => {
    let totalCap = 0;
    let totalProfit = 0;
    const qty = parseInt(formData.quantity) || 0;
    if (qty > 0 && selectedBusiness && formData.investorIds.length > 0) {
      // Split qty evenly among selected investors (or just use average price across all their active)
      let overallActiveAmount = 0;
      let overallActiveQty = 0;
      formData.investorIds.forEach(invId => {
        const activeInvs = state.investments.filter((inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active");
        activeInvs.forEach((inv: any) => {
          overallActiveAmount += inv.amount;
          overallActiveQty += (inv.quantity || (selectedBusiness.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : 0));
        });
      });
      if (overallActiveQty > 0) {
        const avgPrice = overallActiveAmount / overallActiveQty;
        totalCap = avgPrice * qty;
        totalProfit = (currentMarketPrice * qty) - totalCap;
      }
    }
    return { capUsed: totalCap, profit: totalProfit };
  };
`;

// Insert it before calculateCommissions
content = content.replace(
  'const calculateCommissions = () => {',
  sellStatsFunc + '\n  const calculateCommissions = () => {'
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched sell stats helper");
