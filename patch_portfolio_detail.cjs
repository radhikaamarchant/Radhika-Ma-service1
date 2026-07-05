const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

// Add onSellClick to props
content = content.replace(
  /export function LivePortfolioDetail\(\{\n  selectedInvestment,\n  onClose,\n  onBuyClick,\n\}: any\) \{/g,
  'export function LivePortfolioDetail({\n  selectedInvestment,\n  onClose,\n  onBuyClick,\n  onSellClick,\n}: any) {'
);

// Replace setWithdrawStep(1); in EXIT button (desktop)
// There are multiple places where it calculates defaultComm and sets withdrawFormData then setWithdrawStep(1);
// I can just replace the whole block inside onClick of EXIT.

// Let's replace the desktop EXIT button logic
content = content.replace(
  /onClick=\{\(\) => \{\s*setShowTradeOptions\(false\);\s*let defaultComm = 0;[\s\S]*?setWithdrawStep\(1\);\s*\}\}/g,
  `onClick={() => {
    setShowTradeOptions(false);
    if (onSellClick) {
      const activeInvs = selectedInvestment.groupedInvestmentsList.filter((i: any) => selectedInvestmentIds.includes(i.id));
      onSellClick(activeInvs);
    }
  }}`
);

// We should also remove the withdrawStep === 1 rendering block if possible, or just leave it unused.
// Let's remove the withdrawStep === 1 block completely to be clean.
// It starts with `{withdrawStep === 1 && (` and ends at the closing `)}` of that block.
// But it's risky to regex that out. I'll just leave it or it will be unused.

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Patched LivePortfolioDetail");
