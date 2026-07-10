const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const oldTotalProfitPay = `  const totalProfitPay = activeBusinessInvestments.reduce(
    (sum, inv) => sum + (inv.amount * (business.interestRate || 0)) / 100,
    0,
  );`;

const newTotalProfitPay = `  const totalProfitPay = activeBusinessInvestments.reduce((sum, inv) => {
    const trend = marketTrends[businessId] || 0;
    const liveProfit = inv.amount * (trend / 100);
    return sum + Math.max(0, liveProfit);
  }, 0);
  
  const [investorSearchQuery, setInvestorSearchQuery] = useState("");`;

content = content.replace(oldTotalProfitPay, newTotalProfitPay);
fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched total profit and search state");
