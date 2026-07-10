const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetSection = `               <input
                 type="text"
                 placeholder="Search investor..."
                 value={investorSearchQuery}
                 onChange={(e) => setInvestorSearchQuery(e.target.value)}
                 className="w-full md:w-64 border border-kite-border-hard rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-kite-blue"
               />`;

const newSection = `               <input
                 type="text"
                 placeholder="Search investor..."
                 value={investorSearchQuery}
                 onChange={(e) => setInvestorSearchQuery(e.target.value)}
                 className="hidden md:block w-full md:w-64 border border-kite-border-hard rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-kite-blue"
               />`;

if (content.includes(targetSection)) {
  content = content.replace(targetSection, newSection);
}

// And restore totalProfitPay rendering for mobile, wait, totalProfitPay is now the live profit one.
// Let's create oldTotalProfitPay for mobile.
const totalProfitPayTarget = `  const totalProfitPay = activeBusinessInvestments.reduce((sum, inv) => {
    const trend = marketTrends[businessId] || 0;
    const liveProfit = inv.amount * (trend / 100);
    return sum + Math.max(0, liveProfit);
  }, 0);`;

const newTotalProfitPayTarget = `  const totalProfitPay = activeBusinessInvestments.reduce((sum, inv) => {
    const trend = marketTrends[businessId] || 0;
    const liveProfit = inv.amount * (trend / 100);
    return sum + Math.max(0, liveProfit);
  }, 0);
  
  const totalProfitPayMobile = activeBusinessInvestments.reduce(
    (sum, inv) => sum + (inv.amount * (business.interestRate || 0)) / 100,
    0,
  );`;

if (content.includes(totalProfitPayTarget)) {
  content = content.replace(totalProfitPayTarget, newTotalProfitPayTarget);
}

const renderTotalProfitPayOld = `          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total profit pay</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>`;

const renderTotalProfitPayNew = `          <div className="hidden md:flex bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total profit pay</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>
          <div className="md:hidden bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total profit pay</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalProfitPayMobile).replace("₹", "")}</p>
          </div>`;

if (content.includes(renderTotalProfitPayOld)) {
  content = content.replace(renderTotalProfitPayOld, renderTotalProfitPayNew);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched mobile hiding");
