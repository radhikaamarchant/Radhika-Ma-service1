const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStart = `<div className="w-full space-y-6 hidden md:block">`;
const targetEnd = `{selectedBusiness && renderBusinessDetails(selectedBusiness)}`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `<div className="w-full space-y-6 hidden md:block relative min-h-screen">
      {!expandedBusinessId ? (
        <>
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
                      onClick={() => setExpandedBusinessId(b.id)}
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
                  </div>
                )) : (
                  <div className="p-8 text-center text-kite-text-light text-[14px]">No businesses found for this city.</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 z-50 bg-white dark:bg-[#222222] animate-in slide-in-from-right-4 duration-300 rounded-lg shadow-xl border border-kite-border flex flex-col">
          {(() => {
            const b = cityBusinessStats.find((biz: any) => biz.id === expandedBusinessId);
            if (!b) return null;
            return (
              <>
                <div className="flex items-center gap-4 p-4 border-b border-kite-border/50 bg-gray-50 dark:bg-[#1a1a1a] rounded-t-lg">
                  <button 
                    onClick={() => setExpandedBusinessId(null)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kite-text">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-[16px] font-medium text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name}</h2>
                    <p className="text-[12px] text-kite-text-light capitalize">Investors from {selectedCity}</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex justify-between items-center py-3 border-y border-kite-border text-[12px] text-kite-text-light font-medium tracking-wider whitespace-nowrap">
                    <div className="flex-[2]">INVESTOR</div>
                    <div className="flex-1 text-right">Qty.</div>
                    <div className="flex-[1.5] text-right">Equity Price(₹)</div>
                    <div className="flex-[1.5] text-right">Profit Price(₹)</div>
                  </div>
                  
                  <div className="divide-y divide-kite-border/50">
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
                        let totalQty = 0;
                        data.invs.forEach((inv: any) => {
                          totalQty += Number(inv.quantity) || (b.triggerAmount ? Math.floor(inv.amount / b.triggerAmount) : Math.floor(inv.amount / 100)) || 1;
                          
                          if (inv.status === "active") {
                            const { liveProfit } = calculateLiveProfit([inv], b.id, marketState.trends, state.settings);
                            totalProfit += liveProfit;
                          } else if (inv.status === "completed" && inv.payoutDetails) {
                            totalProfit += inv.payoutDetails.totalCredited + (inv.payoutDetails.rmasCommission || 0) + (inv.payoutDetails.happyIncomeTax || 0) - inv.amount;
                          }
                        });

                        return { investor, data, totalProfit, totalQty };
                      }).sort((a, b) => b.data.totalAmount - a.data.totalAmount);

                      return investorList.map(({ investor, data, totalProfit, totalQty }, idx) => (
                        <div key={idx} className="flex justify-between items-center py-4 whitespace-nowrap">
                          <div className="flex-[2] flex items-center gap-4">
                            {investor?.photoUrl ? (
                              <img src={investor.photoUrl} alt="" className="w-[50px] h-[50px] rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                            ) : (
                              <div className="w-[50px] h-[50px] rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[18px] shrink-0">
                                {investor?.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <span className="text-[14px] font-medium text-kite-text truncate max-w-[200px]">{investor?.name || "Unknown"}</span>
                          </div>
                          <div className="flex-1 text-right text-[14px] text-kite-text">
                            {totalQty}
                          </div>
                          <div className="flex-[1.5] text-right text-[14px] text-kite-text font-medium">
                            {formatINR(data.totalAmount)}
                          </div>
                          <div className="flex-[1.5] text-right text-[14px] font-medium">
                            <span className={totalProfit >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}>
                              {totalProfit >= 0 ? "+" : ""}{formatINR(totalProfit)}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
    
    `;
    
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.substring(0, startIndex) + replacement + code.substring(endIndex));
    console.log("Patched render correctly");
} else {
    console.log("Could not find start or end index.");
}
