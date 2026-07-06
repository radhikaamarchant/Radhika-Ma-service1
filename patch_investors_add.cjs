const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// The component props inside viewMode === "investor-detail"
content = content.replace(
  /<InvestorDetail\s+investorId=\{selectedInvestor\.id\}\s+onBack=\{\(\) => \{\s*setViewMode\("list"\);\s*setSelectedInvestor\(null\);\s*\}\}\s+onWithdraw=\{[\s\S]*?\}\s*\/>/,
  `<InvestorDetail
            investorId={selectedInvestor.id}
            onBack={() => {
              setViewMode("list");
              setSelectedInvestor(null);
            }}
            onWithdraw={(invs) => {
              if (invs && invs.length > 0) {
                handleCreditInvestorClick(invs);
              } else {
                handleWithdrawClick(selectedInvestor);
              }
            }}
            onBuyClick={(investment: any) => {
              setAddModalBusinessId(investment.businessId);
              setAddModalInvestorId(investment.investorId);
              setShowAddForm(true);
            }}
          />`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched Investors.tsx");
