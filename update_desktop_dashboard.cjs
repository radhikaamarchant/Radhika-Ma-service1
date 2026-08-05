const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldTableHeader = `              <tr>
                <th className="py-2 px-4 font-normal">Company</th>
                <th className="py-2 px-4 font-normal text-right">LTP</th>
                <th className="py-2 px-4 font-normal text-right">Change %</th>
                <th className="py-2 px-4 font-normal text-right">Funding Req.</th>
                <th className="py-2 px-4 font-normal text-right">Int. Rate</th>
                <th className="py-2 px-4 font-normal text-right">Status</th>
              </tr>`;
              
const newTableHeader = `              <tr>
                <th className="py-2 px-4 font-normal">Company</th>
                <th className="py-2 px-4 font-normal text-right">LTP</th>
                <th className="py-2 px-4 font-normal text-right">Change %</th>
                <th className="py-2 px-4 font-normal text-right">Inv Impect (%)</th>
                <th className="py-2 px-4 font-normal text-right">Expect (%)</th>
                <th className="py-2 px-4 font-normal text-right">Chance (%)</th>
              </tr>`;

code = code.replace(oldTableHeader, newTableHeader);

const tbodyRegex = /<tbody className="divide-y divide-kite-border\/50">([\s\S]*?)<\/tbody>/;
const newTbodyContent = `
              {state.businesses.map(b => {
                const bBasePrice = getCurrentMarketPrice(b, state.investments);
                const { livePrice: bPrice, liveTrend: bTrend } = getLiveFluctuatedPrice(b, bBasePrice, liveTick);
                
                const isUp = bTrend >= 0;
                const trendColor = isUp ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]";
                
                // Calculate dynamic fluctuating percentages
                const hash = b.id.charCodeAt(0) + b.id.charCodeAt(b.id.length - 1);
                const bizInvs = state.investments.filter(i => i.businessId === b.id && i.status === "active");
                const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
                
                // Inv Impect (%)
                const rawImpact = b.fundingRequired > 0 ? (totalInv / b.fundingRequired) * 100 : 0;
                const baseImpact = rawImpact > 0 ? rawImpact : (15 + (hash % 20));
                const invImpactFluctuation = Math.sin((liveTick + hash) * 0.5) * 3.5;
                const invImpact = Math.max(0, baseImpact + invImpactFluctuation);
                
                // Expect (%)
                const expectBase = b.interestRate || 10;
                const expectFluctuation = Math.cos((liveTick + hash) * 0.6) * 1.5;
                const expectVal = Math.max(0, expectBase + expectFluctuation);
                
                // Chance (%)
                const chanceBase = 60 + (hash % 30);
                const chanceFluctuation = Math.sin((liveTick + hash * 2) * 0.4) * 4.5;
                const chance = Math.max(0, Math.min(100, chanceBase + chanceFluctuation));
                
                return (
                <tr 
                  key={b.id} 
                  onClick={() => setDesktopSelectedBusinessId(b.id)}
                  className={\`cursor-pointer transition-colors \${desktopSelectedBusinessId === b.id ? 'bg-kite-blue/5 dark:bg-kite-blue/10' : 'hover:bg-gray-50 dark:hover:bg-[#222222]'}\`}
                >
                  <td className="py-2.5 px-4 font-medium text-kite-blue">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-kite-text">{formatINR(bPrice)}</td>
                  <td className={\`py-2.5 px-4 text-right font-medium \${trendColor}\`}>{isUp ? '+' : ''}{bTrend.toFixed(2)}%</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{invImpact.toFixed(2)}%</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{expectVal.toFixed(2)}%</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{chance.toFixed(2)}%</td>
                </tr>
              )})}
`;

code = code.replace(tbodyRegex, `<tbody className="divide-y divide-kite-border/50">${newTbodyContent}            </tbody>`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Desktop dashboard table updated successfully!");
