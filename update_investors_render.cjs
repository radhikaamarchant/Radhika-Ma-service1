const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const targetStr = `{viewMode === "investor-detail" && selectedInvestor && (
          <InvestorDetail
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
          />
        )}{" "}
        {viewMode === "list" && (
          <div className="w-full">`;

const replaceStr = `{selectedInvestor && (
          <div className="w-full h-full absolute top-0 left-0 bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-50">
            <InvestorDetail
              investorId={selectedInvestor.id}
              onBack={() => {
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
            />
          </div>
        )}{" "}
        <div className={\`w-full h-full \${selectedInvestor ? 'hidden' : 'block'}\`}>
          <div className="w-full">`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated render block");
