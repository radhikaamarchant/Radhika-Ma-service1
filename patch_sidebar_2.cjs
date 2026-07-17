const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

const newLogic = `
        {filteredBusinesses.map((business, index) => {
          const overallTrend = marketState.trends[business.id] ?? business.interestRate;
          
          let displayAmount = 0;
          if (business.triggerAmount) {
            const activeInvs = state.investments.filter(i => i.businessId === business.id && i.status === "active");
            const closedInvs = state.investments.filter(i => i.businessId === business.id && i.status === "completed");

            let totalQtyActive = 0;
            activeInvs.forEach(i => {
              totalQtyActive += (i.quantity || Math.floor(i.amount / (business.triggerAmount || 1)));
            });

            let totalQtyClosed = 0;
            closedInvs.forEach(i => {
              totalQtyClosed += (i.quantity || Math.floor(i.amount / (business.triggerAmount || 1)));
            });

            const increaseAmt = business.triggerAmount * totalQtyActive * (business.increaseMarket || 0) / 100;
            const downAmt = business.triggerAmount * totalQtyClosed * (business.downMarket || 0) / 100;
            displayAmount = business.triggerAmount + increaseAmt - downAmt;
            if(displayAmount < 0) displayAmount = 0;
          } else {
            displayAmount = state.investments.filter(i => i.businessId === business.id).reduce((sum, inv) => sum + inv.amount, 0);
          }
          
          return (
          <div
            key={business.id}
            className="px-4 py-[12px] cursor-pointer border-b border-kite-border hover:bg-gray-50 dark:hover:bg-kite-surface transition-colors group bg-kite-bg"
            onClick={() => {
              setInvestBusinessId(business.id);
              setShowInvestModal(true);
            }}
          >
            <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} baseAmount={displayAmount} roi={business.interestRate} overallTrend={overallTrend} isOpen={isMarketOpen} />
          </div>
        )})}
`;

// use string replace to be safe
code = code.replace(
  "{filteredBusinesses.map((business, index) => {\n          const totalInvested = state.investments.filter(i => i.businessId === business.id).reduce((sum, inv) => sum + inv.amount, 0);\n          const overallTrend = marketState.trends[business.id] ?? business.interestRate;\n          \n          return (\n          <div\n            key={business.id}\n            className=\"px-4 py-[12px] cursor-pointer border-b border-kite-border hover:bg-gray-50 dark:hover:bg-kite-surface transition-colors group bg-kite-bg\"\n            onClick={() => {\n              setInvestBusinessId(business.id);\n              setShowInvestModal(true);\n            }}\n          >\n            <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} baseAmount={totalInvested} roi={business.interestRate} overallTrend={overallTrend} isOpen={isMarketOpen} />\n          </div>\n        )})}",
  newLogic.trim()
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
