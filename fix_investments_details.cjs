const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

let target = `                    <div className="flex justify-between items-start mb-4">
                      {""}
                      <div>
                        {""}
                        <h4 className="text-[15px] md:text-[16px] leading-[20px] font-normal text-kite-blue uppercase">
                          {""}
                          {business?.shortName ? business.shortName.toUpperCase() : business?.name?.toUpperCase()}{""}
                        </h4>{""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                          {""}
                          Investment ID: #{selectedInvestment.id} •{""}
                          {selectedInvestment.status.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <span
                          className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium" +
                            (overallTrend >= 0
                              ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/$1 text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"bg-[#FCEBEB] dark:bg-[#E25F5B]/$1 text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {overallTrend >= 0 ?"+" :""}{""}
                          {overallTrend.toFixed(2)}%{""}
                        </span>{""}
                      </div>{""}
                    </div>`;

let repl = `                    <div className="flex justify-between items-start mb-4">
                      {""}
                      <div>
                        {""}
                        <h4 className="text-[15px] md:text-[16px] leading-[20px] font-normal text-kite-blue uppercase">
                          {""}
                          {business?.shortName ? business.shortName.toUpperCase() : business?.name?.toUpperCase()}{""}
                        </h4>{""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                          {""}
                          Investment ID: #{selectedInvestment.id} •{""}
                          {selectedInvestment.status.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        {(() => {
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
                        })()}
                        {""}
                      </div>{""}
                    </div>`;

content = content.replace(target, repl);

fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Fixed second part of Investments.tsx");
