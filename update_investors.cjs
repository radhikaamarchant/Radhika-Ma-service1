const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Change card to square
content = content.replace(
  /<div className="bg-white dark:bg-\[#2b414f\] rounded-lg border border-gray-300 dark:border-\[#2b414f\] shadow-sm p-4 relative z-10">/g,
  `<div className="bg-white dark:bg-[#2b414f] rounded-none border border-gray-300 dark:border-[#2b414f] shadow-sm p-4 relative z-10">`
);

// Replace P&L lines
const oldPnL = `<div className="flex justify-between items-start">
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
                          </div>`;

const newPnL = `<div className="flex justify-between items-center">
                                <p className="text-[14px] text-kite-text-light mt-1">P&L</p>
                                <div className="flex items-center space-x-2">
                                  <span className={\`text-[16px] font-medium \${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                    {isProfit ? "+" : ""}{formatINR(Math.abs(activeTotalLiveProfit)).replace("₹", "")}
                                  </span>
                                  <span className={\`text-[12px] px-1.5 py-0.5 rounded-sm \${isProfit ? "bg-[#4CAF50]/10 text-[#4CAF50] dark:bg-[#5B9A5D]/10 dark:text-[#5B9A5D]" : "bg-[#DF514C]/10 text-[#DF514C] dark:bg-[#E25F5B]/10 dark:text-[#E25F5B]"}\`}>
                                    {isProfit ? "+" : ""}
                                    {activeTotalInvested > 0
                                      ? ((activeTotalLiveProfit / activeTotalInvested) * 100).toFixed(2)
                                      : "0.00"}%
                                  </span>
                                </div>
                          </div>`;

content = content.replace(oldPnL, newPnL);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated investors.tsx p&l");
