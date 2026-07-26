const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldSummaryRegex = /\{\/\* Kite Style Top Summary Card - Full Width on Mobile \*\/\}[^]+?\{\/\* Kite Style List \*\/\}/m;

const newSummary = `{/* Kite Style Top Summary Card - Full Width on Mobile */}
                          <div className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[12px] text-kite-text-light">Invested</p>
                              <p className="text-[12px] text-kite-text-light">Current</p>
                            </div>
                            <div className="flex justify-between items-start mb-4">
                              <p className="text-[16px] text-kite-text font-medium">
                                {formatINR(activeTotalInvested).replace("₹", "")}
                              </p>
                              <p className="text-[16px] text-kite-text font-medium">
                                {formatINR(curValue).replace("₹", "")}
                              </p>
                            </div>
                            <div className="h-[1px] w-full bg-kite-border-soft mb-4"></div>
                            <div className="flex justify-between items-start">
                              <p className="text-[14px] text-kite-text-light mt-1">P&L</p>
                              <div className="flex flex-col items-end">
                                <span className={\`text-[16px] font-medium \${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                  {isProfit ? "+" : ""}{formatINR(Math.abs(activeTotalLiveProfit)).replace("₹", "")}
                                </span>
                                <span className={\`text-[12px] mt-0.5 \${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                  {isProfit ? "+" : ""}
                                  {activeTotalInvested > 0
                                    ? ((activeTotalLiveProfit / activeTotalInvested) * 100).toFixed(2)
                                    : "0.00"}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Kite Style List */}`;

content = content.replace(oldSummaryRegex, newSummary);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Mobile Summary Fixed");
