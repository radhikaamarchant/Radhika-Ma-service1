const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// I'll regex the whole Desktop Holdings Summary div content
const oldSummary = /\{\/\* Desktop Holdings Summary \*\/\}[^]+?\{\/\* Mobile Holdings List \(Matches Kite App\) \*\/\}/m;

const newSummary = `{/* Desktop Holdings Summary */}
                      {holdings.length > 0 && (
                        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-kite-bg dark:md:bg-[#181818] border-t border-kite-border">
                          <div className="flex space-x-16">
                            <div>
                              <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                                Total investment
                              </p>
                              <p
                                className="text-[16px] text-kite-text font-normal"
                              >
                                {formatINR(activeTotalInvested)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                                Current value
                              </p>
                              <p
                                className="text-[16px] text-kite-text font-normal"
                              >
                                {formatINR(curValue)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-16 text-right">
                            <div className="flex flex-col items-end">
                              <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                                Day's P&L
                              </p>
                              <span className={\`text-[16px] font-medium \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                {activeTotalDayPnL >= 0 ? "+" : ""}{formatINR(Math.abs(activeTotalDayPnL))}
                              </span>
                              <span className={\`text-[12px] mt-0.5 \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                ({activeTotalDayChangePct >= 0 ? "+" : ""}{activeTotalDayChangePct.toFixed(2)}%)
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                                Total P&L
                              </p>
                              <span
                                className={\`text-[16px] font-medium \${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}
                              >
                                {isProfit ? "+" : ""}
                                {formatINR(Math.abs(activeTotalLiveProfit))}
                              </span>
                              <span
                                className={\`text-[12px] mt-0.5 \${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}
                              >
                                ({isProfit ? "+" : ""}
                                {activeTotalInvested > 0
                                  ? (
                                      (activeTotalLiveProfit /
                                        activeTotalInvested) *
                                      100
                                    ).toFixed(2)
                                  : "0.00"}
                                %)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Mobile Holdings List (Matches Kite App) */}`;

content = content.replace(oldSummary, newSummary);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Desktop Summary FIXED!");
