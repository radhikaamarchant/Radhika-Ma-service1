const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const replacement1 = `
  const getLiveFluctuatedPrice = (b: any, basePrice: number, tick: number) => {
    if (!b) return { livePrice: 0, liveTrend: 0 };
    const hash = b.id.charCodeAt(0) + b.id.charCodeAt(b.id.length - 1);
    // 0.1% fluctuation max
    const fluctuation = Math.sin((tick + hash) * 0.5) * (basePrice * 0.001);
    const livePrice = basePrice + fluctuation;
    
    const originalPrice = b.triggerAmount || 100;
    const baseTrend = marketState.trends[b.id] ?? b.interestRate ?? 0;
    const liveTrend = baseTrend + ((fluctuation / originalPrice) * 100);
    
    return { livePrice, liveTrend };
  };

  // Calculate prices for the Option Chain based on the selected company's ACTUAL price
  const { spotPrice, spotChange, percentageChange } = useMemo(() => {
    if (!desktopSelectedBusiness) return { spotPrice: 0, spotChange: 0, percentageChange: 0 };
    const basePrice = getCurrentMarketPrice(desktopSelectedBusiness, state.investments);
    const { livePrice, liveTrend } = getLiveFluctuatedPrice(desktopSelectedBusiness, basePrice, liveTick);
    
    const originalPrice = desktopSelectedBusiness.triggerAmount || 100;
    const absoluteDiff = livePrice - originalPrice;
    
    return { spotPrice: livePrice, spotChange: absoluteDiff, percentageChange: liveTrend };
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);
`;

code = code.replace(
`  // Calculate prices for the Option Chain based on the selected company's ACTUAL price
  const { spotPrice, spotChange, percentageChange } = useMemo(() => {
    if (!desktopSelectedBusiness) return { spotPrice: 0, spotChange: 0, percentageChange: 0 };
    const basePrice = getCurrentMarketPrice(desktopSelectedBusiness, state.investments);
    const originalPrice = desktopSelectedBusiness.triggerAmount || 100;
    
    // We use a deterministic live tick so it fluctuates, but strictly aligns with what's shown!
    // Wait, to strictly align with the Top List, we should use the EXACT same basePrice.
    // If we want the Top List to also fluctuate, we should use a global fluctuating function, 
    // but the simplest way to perfectly align is to just use the exact market price without artificial ticks.
    
    const livePrice = basePrice;
    const absoluteDiff = livePrice - originalPrice;
    const baseTrend = marketState.trends[desktopSelectedBusiness.id] ?? desktopSelectedBusiness.interestRate ?? 0;
    
    return { spotPrice: livePrice, spotChange: absoluteDiff, percentageChange: baseTrend };
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);`,
replacement1
);


const tbodyRegex = /<tbody className="divide-y divide-kite-border\/50">([\s\S]*?)<\/tbody>/;
const newTbodyContent = `
              {state.businesses.map(b => {
                const bBasePrice = getCurrentMarketPrice(b, state.investments);
                const { livePrice: bPrice, liveTrend: bTrend } = getLiveFluctuatedPrice(b, bBasePrice, liveTick);
                
                const isUp = bTrend >= 0;
                const trendColor = isUp ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]";
                
                return (
                <tr 
                  key={b.id} 
                  onClick={() => setDesktopSelectedBusinessId(b.id)}
                  className={\`cursor-pointer transition-colors \${desktopSelectedBusinessId === b.id ? 'bg-kite-blue/5 dark:bg-kite-blue/10' : 'hover:bg-gray-50 dark:hover:bg-[#222222]'}\`}
                >
                  <td className="py-2.5 px-4 font-medium text-kite-blue">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-kite-text">{formatINR(bPrice)}</td>
                  <td className={\`py-2.5 px-4 text-right font-medium \${trendColor}\`}>{isUp ? '+' : ''}{bTrend.toFixed(2)}%</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{formatINR(b.fundingRequired)}</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{b.interestRate}%</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={\`px-2 py-0.5 rounded text-[11px] uppercase \${b.status === 'listed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}\`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              )})}
`;

code = code.replace(tbodyRegex, `<tbody className="divide-y divide-kite-border/50">${newTbodyContent}            </tbody>`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard.tsx patched successfully!");
