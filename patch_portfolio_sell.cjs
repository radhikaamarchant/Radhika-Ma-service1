const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

const replacement = `onClick={() => {
    setShowTradeOptions(false);
    let defaultComm = 0;
    let defaultTax = 0;
    const prof = globalCalculateLiveProfit(
      selectedInvestment.groupedInvestmentsList.filter(
        (i: any) => selectedInvestmentIds.includes(i.id),
      ),
      selectedInvestment.businessId,
      marketState.trends,
      state.settings,
    ).liveProfit;
    if (state.settings) {
      if (state.settings.rmasCommission?.enabled) {
        defaultComm =
          state.settings.rmasCommission.type === "percentage"
            ? (prof * state.settings.rmasCommission.value) / 100
            : state.settings.rmasCommission.value;
      }
      if (state.settings.tax?.enabled) {
        defaultTax =
          state.settings.tax.type === "percentage"
            ? (prof * state.settings.tax.value) / 100
            : state.settings.tax.value;
      }
    }
    setWithdrawFormData({
      ...withdrawFormData,
      completedMonths: String(selectedInvestment.timePeriodMonths),
      rmasCommission: Math.max(0, defaultComm).toFixed(2),
      happyIncomeTax: Math.max(0, defaultTax).toFixed(2),
    });
    setWithdrawStep(1);
  }}`;

const target1 = /onClick=\{\(\) => \{\s*setShowTradeOptions\(false\);\s*if \(onSellClick\) \{\s*const activeInvs = selectedInvestment\.groupedInvestmentsList\.filter\(\(i: any\) => selectedInvestmentIds\.includes\(i\.id\)\);\s*onSellClick\(activeInvs\);\s*\}\s*\}\}/g;

content = content.replace(target1, replacement);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Patched SELL buttons!");
