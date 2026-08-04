const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStart = `<div className="w-full space-y-6 hidden md:block">`;
const targetEnd = `{selectedBusiness && renderBusinessDetails(selectedBusiness)}`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `<div className="w-full space-y-6 hidden md:block">
      <div className="px-4 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
        <div>
          <h2 className="text-[15px] md:text-[16px] font-medium text-kite-text tracking-tight">
            City view
          </h2>
        </div>
      </div>
      
      <div className="sticky top-0 z-40 bg-white dark:bg-kite-bg dark:md:bg-[#181818] pt-2 pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex overflow-x-auto no-scrollbar border-b border-kite-border/50 items-center whitespace-nowrap">
          {cities.map((city: string) => (
            <button
              key={city}
              onClick={() => { setSelectedCity(city); setExpandedBusinessId(null); }}
              className={\`px-4 py-3 text-[13px] md:text-[14px] font-medium transition-colors relative capitalize \${
                selectedCity === city
                  ? "text-kite-blue"
                  : "text-kite-text-light hover:text-kite-text"
              }\`}
            >
              {city}
              {selectedCity === city && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pb-8">
        <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden w-full">
          <div className="divide-y divide-kite-border">
            {cityBusinessStats.length > 0 ? cityBusinessStats.map((b: any) => (
              <div key={b.id} className="flex flex-col">
                <div 
                  className="p-4 flex justify-between items-center hover:bg-kite-bg/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedBusinessId(expandedBusinessId === b.id ? null : b.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>
                    <span className="text-xs text-kite-text/60 mt-0.5">{b.ownerName}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-[15px] text-kite-text">{formatINR(b.totalInvested)}</span>
                    <span className="text-[12px] text-kite-text-light">Total Invested from <span className="capitalize">{selectedCity}</span></span>
                  </div>
                </div>
                
                {expandedBusinessId === b.id && (
                  <div className="bg-gray-50 dark:bg-[#121212] border-t border-kite-border/50 p-4 divide-y divide-kite-border/50">
                    <div className="flex justify-between items-center pb-2 text-[12px] text-kite-text-light font-medium uppercase tracking-wider">
                      <div className="flex-[2]">Investor</div>
                      <div className="flex-1 text-right">Qty</div>
                      <div className="flex-[1.5] text-right">Amount</div>
                      <div className="flex-[1.5] text-right">Profit</div>
                    </div>
                    {(() => {
                      const investorMap = new Map();
                      b.bizInvs.forEach((inv: any) => {
                        if (!investorMap.has(inv.investorId)) {
                          investorMap.set(inv.investorId, { invs: [], totalAmount: 0 });
                        }
                        const entry = investorMap.get(inv.investorId);
                        entry.invs.push(inv);
                        entry.totalAmount += inv.amount;
                      });

                      const investorList = Array.from(investorMap.entries()).map(([invId, data]) => {
                        const investor = cityInvestors.find((i: any) => i.id === invId);
                        
                        let totalProfit = 0;
                        data.invs.forEach((inv: any) => {
                          if (inv.status === "active") {
                            const { profit } = calculateLiveProfit([inv], b.id, marketState.trends, state.settings);
                            totalProfit += profit;
                          } else if (inv.status === "completed" && inv.payoutDetails) {
                            totalProfit += inv.payoutDetails.totalCredited + (inv.payoutDetails.rmasCommission || 0) + (inv.payoutDetails.happyIncomeTax || 0) - inv.amount;
                          }
                        });

                        return { investor, data, totalProfit };
                      }).sort((a, b) => b.data.totalAmount - a.data.totalAmount);

                      return investorList.map(({ investor, data, totalProfit }, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3">
                          <div className="flex-[2] flex items-center gap-3">
                            {investor?.photoUrl ? (
                              <img src={investor.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                {investor?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <span className="text-[13px] font-medium text-kite-text">{investor?.name || "Unknown"}</span>
                          </div>
                          <div className="flex-1 text-right text-[13px] text-kite-text">
                            {data.invs.length}
                          </div>
                          <div className="flex-[1.5] text-right text-[13px] text-kite-text font-medium">
                            {formatINR(data.totalAmount)}
                          </div>
                          <div className="flex-[1.5] text-right text-[13px] font-medium">
                            <span className={totalProfit >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}>
                              {totalProfit >= 0 ? "+" : ""}{formatINR(totalProfit)}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )) : (
              <div className="p-8 text-center text-kite-text-light text-[14px]">No businesses found for this city.</div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    `;
    
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.substring(0, startIndex) + replacement + code.substring(endIndex));
    console.log("Patched render correctly");
} else {
    console.log("Could not find start or end index.");
}
