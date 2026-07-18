const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const insertTarget = `  return (\n    <div className="w-full flex flex-col font-sans bg-kite-surface dark:bg-transparent">`;

const codeToInsert = `  const renderedList = useMemo(() => {
    return (
      <>
        <div className="flex flex-col pb-16">
          {""}
          {groupedInvestments.map((inv, idx) => {
            const business = state.businesses.find(
              (b) => b.id === inv.businessId,
            );
            const investor = state.investors.find(
              (i) => i.id === inv.investorId,
            );
            const overallTrend = marketState.trends[inv.businessId] || 0;
            const isCompleted = inv.status ==="completed";
            const actualProfit =
              isCompleted && inv.payoutDetails
                ? inv.payoutDetails.totalCredited +
                  (inv.payoutDetails.rmasCommission || 0) +
                  (inv.payoutDetails.happyIncomeTax || 0) -
                  inv.amount
                : 0;
            let liveProf = 0;
            let currentVal = inv.amount;
            if (!isCompleted) {
              const { liveProfit, currentValue } = globalCalculateLiveProfit(
                [inv],
                inv.businessId,
                marketState.trends,
                state.settings,
              );
              liveProf = liveProfit;
              currentVal = currentValue;
            }
            const holdingProfit = isCompleted ? actualProfit : liveProf;
            const curValue = isCompleted
              ? inv.amount + holdingProfit
              : currentVal;
            const pnlPercentage = isCompleted
              ? (holdingProfit / inv.amount) * 100
              : overallTrend;
            const isProfit = holdingProfit >= 0;
            // Quantities & Averages
            const qty = inv.groupedInvestmentsList.reduce((sum, item) => sum + (item.quantity || 1), 0);
            const avgPrice = inv.amount / qty;
            const currentLTP = curValue / qty;
            const isOverallTrendPositive = overallTrend >= 0;
            
            return (
              <div
                key={\`grouped_\${inv.key}_\${idx}\`}
                className="w-full flex flex-col md:flex-row md:items-stretch px-4 py-3 md:py-0 hover:bg-gray-50 dark:hover:bg-[#202020] border-b border-kite-border-soft transition-colors cursor-pointer group font-sans outline-none focus:outline-none focus:ring-0 focus:bg-transparent dark:focus:bg-[#202020] active:outline-none"
                onClick={() => {
                  setSelectedInvestment(inv);
                  setSelectedInvestmentIds(
                    inv.groupedInvestmentsList.map((i) => i.id),
                  );
                  setWithdrawStep(0);
                }}
              >
                {/* MOBILE VIEW */}
                <div className="md:hidden flex flex-col w-full">
                  {/* Line 1: Metrics Row (Qty & Avg) */}
                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                    <div className="flex items-center text-[11px] md:text-[12px]">
                       <span className="text-kite-text-light font-normal mr-1">Qty.</span>
                       <span className="text-kite-text font-normal tracking-wide">{qty}</span>
                       <span className="text-kite-text-light mx-1.5">•</span>
                       <span className="text-kite-text-light font-normal mr-1">Avg.</span>
                       <span className="text-kite-text font-normal tracking-wide">{formatINR(avgPrice).replace("₹", "")}</span>
                    </div>
                    <div className={\`text-[11px] md:text-[12px] font-normal \${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}\`}>
                      {isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                  {/* Line 2: Core Business Name & Absolute P&L Row */}
                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                     <div className="flex items-center gap-1.5">
                        <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                           {business?.shortName ? business.shortName.toUpperCase() : (business?.name?.toUpperCase() || "UNKNOWN BUSINESS")}
                        </h3>
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck
                            className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0"
                            title="RMAS Verified"
                          />
                        )}
                     </div>
                     <div className={\`text-[13px] md:text-[14px] font-normal \${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}\`}>
                       {isProfit && holdingProfit >= 0 ? "+" : ""}
                       {formatINR(holdingProfit).replace("₹", "")}
                     </div>
                  </div>
                  {/* Line 3: Footer Row (Investor Info & LTP) */}
                  <div className="flex justify-between items-center leading-tight">
                     <div className="flex items-center text-[10px] md:text-[11px]">
                       <span className="text-kite-text-light font-normal mr-1">Investor:</span>
                       <span className="text-kite-text font-normal uppercase tracking-wide">{investor?.name?.toUpperCase()}</span>
                     </div>
                     <div className="flex items-center text-[11px] md:text-[12px]">
                       <span className="text-kite-text-light font-normal mr-1">LTP</span>
                       <span className="text-kite-text font-normal tracking-wide">{formatINR(currentLTP).replace("₹", "")}</span>
                     </div>
                  </div>
                </div>
                {/* DESKTOP VIEW */}
                <div className="hidden md:flex flex-row items-stretch justify-between w-full text-[13px]">
                   <div className="w-4/12 flex flex-col gap-[2px] justify-center py-3">
                      <div className="flex items-center gap-1.5 text-kite-text font-normal text-[13px] leading-[18px] uppercase tracking-wide desktop-business-name">
                        {business?.shortName ? business.shortName.toUpperCase() : (business?.name?.toUpperCase() || "UNKNOWN BUSINESS")}
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0" title="RMAS Verified" />
                        )}
                      </div>
                      <span className="text-kite-text-light font-normal text-[12px] leading-[18px] uppercase tracking-wide desktop-investor-name">
                        {investor?.name?.toUpperCase()}
                      </span>
                   </div>
                   <div className="w-1/12 text-right text-kite-text-light flex flex-col justify-center py-3">{qty}</div>
                   <div className="w-2/12 text-right text-kite-text-light flex flex-col justify-center py-3">{formatINR(avgPrice).replace("₹", "")}</div>
                   <div className="w-2/12 text-right text-kite-text-light pr-5 flex flex-col justify-center py-3">{formatINR(curValue).replace("₹", "")}</div>
                   <div className={\`w-2/12 text-right font-normal text-[12px] leading-[16px] desktop-pnl pl-5 border-l border-kite-vertical-divider flex flex-col justify-center py-3 \${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}\`}>
                      <div className="block">{isProfit && holdingProfit >= 0 ? "+" : ""}{formatINR(holdingProfit).replace("₹", "")}</div>
                   </div>
                   <div className={\`w-1/12 text-right font-normal text-[12px] leading-[16px] desktop-net-chg flex flex-col justify-center py-3 \${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}\`}>
                      <div className="block">{isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%</div>
                   </div>
                </div>
              </div>
            );
          })}
          {""}
          {groupedInvestments.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              {""}
              <p className="text-kite-text-muted text-[13px] md:text-[14px] font-light">
                {""}
                No investments found.
                {""}
              </p>
              {""}
            </div>
          )}
          {""}
        </div>
        {""}
        {/* Sticky Bottom Summary Bar */}
        {""}
        {groupedInvestments.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:relative bg-kite-surface border-t border-kite-border px-4 py-3 flex justify-between items-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] z-30">
            {""}
            <span className="text-[11px] md:text-[12px] font-medium text-kite-text-light tracking-wide">
              {""}
              Day's P&L
              {""}
            </span>
            {""}
            {(() => {
              const totalInvested = groupedInvestments.reduce(
                (sum, inv) => sum + inv.amount,
                0,
              );
              const totalLiveProfit = groupedInvestments.reduce((sum, inv) => {
                const isCompleted = inv.status ==="completed";
                if (isCompleted) {
                  return (
                    sum +
                    (inv.payoutDetails
                      ? inv.payoutDetails.totalCredited +
                        (inv.payoutDetails.rmasCommission || 0) +
                        (inv.payoutDetails.happyIncomeTax || 0) -
                        inv.amount
                      : 0)
                  );
                }
                return (
                  sum +
                  globalCalculateLiveProfit(
                    [inv],
                    inv.businessId,
                    marketState.trends,
                    state.settings,
                  ).liveProfit
                );
              }, 0);
              const totalPnlPercentage =
                totalInvested > 0 ? (totalLiveProfit / totalInvested) * 100 : 0;
              const isTotalProfit = totalLiveProfit >= 0;
              return (
                <div className="flex items-center gap-2">
                  {""}
                  <span
                    className={\`text-[13px] md:text-[14px] font-normal \${isTotalProfit ?"text-[#16A34A]" :"text-[#DC2626]"}\`}
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {""}
                    {isTotalProfit && totalLiveProfit > 0 ?"+" :""}
                    {""}
                    {formatINR(totalLiveProfit)}
                    {""}
                  </span>
                  {""}
                  <span
                    className={\`text-[11px] md:text-[12px] font-normal \${isTotalProfit ?"text-[#16A34A]" :"text-[#DC2626]"}\`}
                  >
                    {""}
                    {isTotalProfit ?"+" :""} {totalPnlPercentage.toFixed(2)}
                    %
                    {""}
                  </span>
                  {""}
                </div>
              );
            })()}
            {""}
          </div>
        )}
      </>
    );
  }, [groupedInvestments, state.businesses, state.investors, marketState.trends, state.settings, blueTickBusinessIds]);

`;

const insertIdx = code.indexOf(insertTarget);

if (insertIdx !== -1) {
  code = code.substring(0, insertIdx) + codeToInsert + code.substring(insertIdx);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Successfully inserted renderedList');
} else {
  console.log('Could not find insert string');
}
