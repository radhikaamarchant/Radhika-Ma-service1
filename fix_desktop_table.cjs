const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Replace table headers
content = content.replace(
/                            <th className="py-3 px-4 font-normal text-left">\s*Instrument\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*Qty\.\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*Avg\. cost\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*LTP\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*Cur\. val\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*Total P&L \(₹\)\s*<\/th>\s*<th className="py-3 px-4 font-normal text-right">\s*Overall Return \(%\)\s*<\/th>/,
`                            <th className="py-3 px-4 font-normal text-left border-r border-kite-border pr-6">
                              Instrument
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Qty.
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Avg. cost
                            </th>
                            <th className="py-3 px-4 font-normal text-right border-r border-kite-border pr-6">
                              LTP
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Cur. val
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Total P&L (₹)
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Overall Return (%)
                            </th>
                            <th className="py-3 px-4 font-normal text-right">
                              Day chg.
                            </th>`
);

content = content.replace(/<td colSpan=\{7\}>/, '<td colSpan={8}>');

// We also need to fix the row cells.
content = content.replace(
/<td className="py-4 px-4 text-kite-text font-normal">\s*\{h\.business\?\.name\?\.toUpperCase\(\) \|\|\s*"UNKNOWN"\}\s*<\/td>/,
`<td className="py-4 px-4 text-kite-text font-normal border-r border-kite-border pr-6">
                                    {h.business?.name?.toUpperCase() ||
                                      "UNKNOWN"}
                                  </td>`
);

content = content.replace(
/<td className="py-4 px-4 text-right">\s*<div className="text-kite-text font-normal">\s*\{Math\.abs\(ltp\)\.toFixed\(2\)\}\s*<\/div>\s*<div className=\{\`text-xs mt-0\.5 \$\{h\.dayChangePct >= 0 \? 'text-\[#4CAF50\] dark:text-\[#5B9A5D\]' : 'text-\[#DF514C\] dark:text-\[#E25F5B\]'\}\`\}>\s*\{h\.dayChangePct >= 0 \? "\+" : ""\}\{h\.dayChangePct\.toFixed\(2\)\}\%\s*<\/div>\s*<\/td>/,
`<td className="py-4 px-4 text-right text-kite-text font-normal border-r border-kite-border pr-6">
                                    {Math.abs(ltp).toFixed(2)}
                                  </td>`
);

// We need to inject the day chg cell at the end of the row
content = content.replace(
/                                  <td\s*className=\{\`py-4 px-4 text-right font-normal \$\{h\.liveProfit >= 0 \? "text-\[#4CAF50\] dark:text-\[#5B9A5D\]" : "text-\[#DF514C\] dark:text-\[#E25F5B\]"\}\`\}\s*>\s*\{h\.liveProfit >= 0 \? "\+" : ""\}\s*\{pnlPercent\.toFixed\(2\)\}\%\s*<\/td>\s*<\/tr>/,
`                                  <td
                                    className={\`py-4 px-4 text-right font-normal \${h.liveProfit >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}
                                  >
                                    {h.liveProfit >= 0 ? "+" : ""}
                                    {pnlPercent.toFixed(2)}%
                                  </td>
                                  <td
                                    className={\`py-4 px-4 text-right font-normal \${h.dayChangePct >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}
                                  >
                                    {h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(2)}%
                                  </td>
                                </tr>`
);

// Replace Summary
content = content.replace(
/<div className="text-right flex space-x-12">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
`<div className="text-right flex space-x-16">
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
                                {formatINR(activeTotalLiveProfit)}
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
                      )}`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Desktop table redesign applied!");
