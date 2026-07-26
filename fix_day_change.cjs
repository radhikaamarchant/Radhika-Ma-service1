const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const helper = `
// Helper for deterministic day change
const getDayChangePct = (bizId: string) => {
  const hash = bizId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const today = new Date();
  const dateStr = \`\${today.getFullYear()}-\${today.getMonth()}-\${today.getDate()}\`;
  const todayHash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const combined = ((hash * 31) + todayHash) % 1000; 
  return ((combined / 1000) * 10) - 5; // -5.00% to +5.00%
};
`;

if (!content.includes('getDayChangePct')) {
  content = content.replace('export default function Investors() {', helper + '\nexport default function Investors() {');
}

content = content.replace(
/let activeTotalInvested = 0;\s*let activeTotalLiveProfit = 0;\s*let activeTotalCurrentValue = 0;[\s\S]*?return \{\s*bizId,\s*business,\s*invs,\s*investedAmount,\s*liveProfit,\s*liveTrendPercentage,\s*currentValue,\s*\};\s*\},?\s*\);/,
`let activeTotalInvested = 0;
            let activeTotalLiveProfit = 0;
            let activeTotalCurrentValue = 0;
            let activeTotalDayPnL = 0;
            let activeTotalYesterdayValue = 0;

            const holdings = Object.entries(groupedActive).map(
              ([bizId, invs]) => {
                const business = state.businesses.find((b) => b.id === bizId);
                const {
                  investedAmount,
                  liveTrendPercentage,
                  liveProfit,
                  currentValue,
                } = calculateLiveProfit(
                  invs as Investment[],
                  bizId,
                  marketState.trends,
                  state.settings,
                );
                
                const qty = (invs as Investment[]).reduce((sum, inv) => {
                  if (inv.quantity) return sum + inv.quantity;
                  if (business && business.triggerAmount) {
                    return sum + Math.floor(inv.amount / business.triggerAmount);
                  }
                  return sum + 1;
                }, 0);
                
                const ltp = qty > 0 ? currentValue / qty : 0;
                const dayChangePct = getDayChangePct(bizId);
                const yesterdayLtp = ltp / (1 + (dayChangePct / 100));
                const dayPnL = (ltp - yesterdayLtp) * qty;

                activeTotalInvested += investedAmount;
                activeTotalLiveProfit += liveProfit;
                activeTotalCurrentValue += currentValue;
                activeTotalDayPnL += dayPnL;
                activeTotalYesterdayValue += (yesterdayLtp * qty);

                return {
                  bizId,
                  business,
                  invs,
                  investedAmount,
                  liveProfit,
                  liveTrendPercentage,
                  currentValue,
                  dayChangePct,
                };
              }
            );
            
            const activeTotalDayChangePct = activeTotalYesterdayValue > 0 ? (activeTotalDayPnL / activeTotalYesterdayValue) * 100 : 0;
`
);

content = content.replace(
/<td\s*className="py-4 px-4 text-right text-kite-text font-normal"\s*>\s*\{ltp\.toFixed\(2\)\}\s*<\/td>/,
`<td className="py-4 px-4 text-right">
                                    <div className="text-kite-text font-normal">
                                      {Math.abs(ltp).toFixed(2)}
                                    </div>
                                    <div className={\`text-xs mt-0.5 \${h.dayChangePct >= 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#DF514C] dark:text-[#E25F5B]'}\`}>
                                      {h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(2)}%
                                    </div>
                                  </td>`
);

content = content.replace(
/<span className="text-kite-text font-normal tracking-wide">\s*\{ltp\.toFixed\(2\)\}\s*<\/span>\s*<span\s*className=\{\`ml-1 \$\{h\.liveTrendPercentage >= 0 \? "text-\[#4CAF50\] dark:text-\[#5B9A5D\]" : "text-\[#DF514C\] dark:text-\[#E25F5B\]"\}\`\}\s*>\s*\(\{h\.liveTrendPercentage >= 0 \? "\+" : ""\}\s*\{h\.liveTrendPercentage\.toFixed\(2\)\}\%\)\s*<\/span>/,
`<span className="text-kite-text font-normal tracking-wide">
                                        {Math.abs(ltp).toFixed(2)}
                                      </span>
                                      <span
                                        className={\`ml-1 \${h.dayChangePct >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}
                                      >
                                        ({h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(2)}%)
                                      </span>`
);

content = content.replace(
/<div className="text-right">\s*<p className="text-\[12px\] text-kite-text mb-1 uppercase tracking-wider">\s*Total P&L \(₹\)\s*<\/p>/,
`<div className="text-right flex space-x-12">
                          <div className="text-right">
                            <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                              1-Day P&L
                            </p>
                            <div className="flex items-center justify-end space-x-2">
                              <span className={\`text-[16px] font-medium \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                {activeTotalDayPnL >= 0 ? "+" : ""}{formatINR(Math.abs(activeTotalDayPnL))}
                              </span>
                              <span className={\`text-[12px] font-medium px-2 py-0.5 rounded-sm \${activeTotalDayPnL >= 0 ? "bg-kite-green/10 text-[#4CAF50] dark:text-[#5B9A5D]" : "bg-kite-red/10 text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                {activeTotalDayChangePct >= 0 ? "+" : ""}{activeTotalDayChangePct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] text-kite-text mb-1 uppercase tracking-wider">
                              Total P&L (₹)
                            </p>`
);

content = content.replace(
/<div className="h-\[1px\] w-full bg-kite-border-soft mb-4"><\/div>\s*<div className="flex justify-between items-center">\s*<p className="text-\[14px\] text-kite-text-light">\s*Total P&L \(₹\)\s*<\/p>/,
`<div className="h-[1px] w-full bg-kite-border-soft mb-4"></div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[14px] text-kite-text-light">
                                1-Day P&L
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className={\`text-[16px] font-normal \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                  {activeTotalDayPnL >= 0 ? "+" : ""}{formatINR(Math.abs(activeTotalDayPnL)).replace("₹", "")}
                                </span>
                                <span className={\`text-[11px] px-1.5 py-0.5 rounded-sm \${activeTotalDayPnL >= 0 ? "bg-kite-green/10 text-[#4CAF50] dark:text-[#5B9A5D]" : "bg-kite-red/10 text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                  {activeTotalDayChangePct >= 0 ? "+" : ""}{activeTotalDayChangePct.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-[14px] text-kite-text-light">
                                Total P&L (₹)
                              </p>`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Replaced successfully!");
