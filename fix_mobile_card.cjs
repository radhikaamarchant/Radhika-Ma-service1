const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldCardRegex = /\{\/\* Line 1: Metrics Row \(Qty & Avg\) \*\/\}[^]+?\{\/\* Active IPO Apps on Mobile \*\/\}/m;

const newCard = `<div className="flex justify-between items-stretch">
                                  <div className="flex flex-col gap-1.5 justify-between">
                                    <div className="text-[11px] md:text-[12px] text-kite-text-light">
                                      Qty. {qty} • Avg. {avgPrice.toFixed(2)}
                                    </div>
                                    <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wide uppercase">
                                      {(h.business?.shortName || h.business?.name)?.toUpperCase() || "UNKNOWN"}
                                    </h3>
                                    <div className="text-[11px] md:text-[12px] text-kite-text-light">
                                      Invested {formatINR(h.investedAmount).replace("₹", "")}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1.5 justify-between text-right items-end">
                                    <div className={\`text-[11px] md:text-[12px] \${pnlPercent >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                      {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                                    </div>
                                    <div className={\`text-[13px] md:text-[14px] font-medium \${h.liveProfit >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                      {h.liveProfit >= 0 ? "+" : ""}{formatINR(Math.abs(h.liveProfit)).replace("₹", "")}
                                    </div>
                                    <div className="text-[11px] md:text-[12px] text-kite-text-light">
                                      LTP {Math.abs(ltp).toFixed(2)} <span className={\`ml-0.5 \${h.dayChangePct >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>({h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(2)}%)</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Active IPO Apps on Mobile */}`;

content = content.replace(oldCardRegex, newCard);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Mobile Card Fixed");
