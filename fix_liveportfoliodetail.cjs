const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf-8');

// find where overallTrend is used.
let target = `                        <span
                          className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium " +
                            (overallTrend >= 0
                              ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/10 text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"bg-[#FCEBEB] dark:bg-[#E25F5B]/10 text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {overallTrend >= 0 ?"+" :""}{""}
                          {overallTrend.toFixed(2)}%{""}
                        </span>`;

let repl = `                        {(() => {
                           const { fullLiveProfit } = calculateLiveProfit();
                           const pct = isCompleted && selectedInvestment.payoutDetails 
                              ? ( (selectedInvestment.payoutDetails.totalCredited + (selectedInvestment.payoutDetails.rmasCommission || 0) + (selectedInvestment.payoutDetails.happyIncomeTax || 0) - selectedInvestment.amount) / selectedInvestment.amount ) * 100
                              : (fullLiveProfit / totalAmount) * 100;
                           return (
                             <span
                               className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium " +
                                 (pct >= 0
                                   ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/10 text-[#4CAF50] dark:text-[#5B9A5D]"
                                   :"bg-[#FCEBEB] dark:bg-[#E25F5B]/10 text-[#DF514C] dark:text-[#E25F5B]")
                               }
                             >
                               {""}
                               {pct >= 0 ?"+" :""}{""}
                               {pct.toFixed(2)}%{""}
                             </span>
                           );
                        })()}`;

content = content.replace(target, repl);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Fixed LivePortfolioDetail.tsx");
