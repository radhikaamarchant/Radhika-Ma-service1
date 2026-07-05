const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

content = content.replace(
  /interface InvestorDetailProps \{\n  investorId: string;\n  onBack: \(\) => void;\n  onWithdraw\?: \(\) => void;\n\}/,
  'interface InvestorDetailProps {\n  investorId: string;\n  onBack: () => void;\n  onWithdraw?: (investments: any[]) => void;\n  onBuyClick?: (investment: any) => void;\n}'
);

content = content.replace(
  /export default function InvestorDetail\(\{\n  investorId,\n  onBack,\n  onWithdraw,\n\}: InvestorDetailProps\) \{/,
  'export default function InvestorDetail({\n  investorId,\n  onBack,\n  onWithdraw,\n  onBuyClick,\n}: InvestorDetailProps) {'
);

content = content.replace(
  /<LivePortfolioDetail\n          selectedInvestment=\{selectedPortfolioInvestment\}\n          onClose=\{\(\) => setSelectedPortfolioInvestment\(null\)\}\n        \/>/,
  '<LivePortfolioDetail\n          selectedInvestment={selectedPortfolioInvestment}\n          onClose={() => setSelectedPortfolioInvestment(null)}\n          onSellClick={onWithdraw}\n          onBuyClick={onBuyClick}\n        />'
);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
console.log("Patched InvestorDetail");
