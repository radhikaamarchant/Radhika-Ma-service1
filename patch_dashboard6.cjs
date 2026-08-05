const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Fix getLiveFluctuatedPrice
const oldLiveFluctuatedPrice = `
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
  };`;

const newLiveFluctuatedPrice = `
  const getLiveFluctuatedPrice = (b: any, basePrice: number, tick: number) => {
    if (!b) return { livePrice: 0, liveTrend: 0 };
    const hash = b.id.charCodeAt(0) + b.id.charCodeAt(b.id.length - 1);
    // 0.1% fluctuation max
    const fluctuation = Math.sin((tick + hash) * 0.5) * (basePrice * 0.001);
    const livePrice = basePrice + fluctuation;
    
    const baseTrend = marketState.trends[b.id] ?? b.interestRate ?? 0;
    const liveTrend = baseTrend; // Strictly match the sidebar percentage
    
    return { livePrice, liveTrend };
  };`;
code = code.replace(oldLiveFluctuatedPrice, newLiveFluctuatedPrice);

// Fix Inv Impect (%)
const oldInvImpactLogic = `
                // Inv Impect (%)
                const rawImpact = b.fundingRequired > 0 ? (totalInv / b.fundingRequired) * 100 : 0;
                const baseImpact = rawImpact > 0 ? rawImpact : (15 + (hash % 20));
                const invImpactFluctuation = Math.sin((liveTick + hash) * 0.5) * 3.5;
                const invImpact = Math.max(1, Math.min(100, baseImpact + invImpactFluctuation));`;

const newInvImpactLogic = `
                // Inv Impect (%)
                const baseImpact = b.fundingRequired > 0 ? (totalInv / b.fundingRequired) * 100 : 0;
                const invImpactFluctuation = (baseImpact < 100 && baseImpact > 0) ? Math.sin((liveTick + hash) * 0.5) * 1.5 : 0;
                const invImpact = Math.min(100, Math.max(0, baseImpact + invImpactFluctuation));`;
code = code.replace(oldInvImpactLogic, newInvImpactLogic);

// Fix Section Headers
code = code.replace(
  '<h2 className="text-[13px] font-medium text-kite-text uppercase tracking-wider">Liqudity Price(₹)</h2>',
  '<h2 className="text-[13px] font-medium text-kite-text tracking-wider">Liqudity Price (₹)</h2>'
);

// Option Chain Headers
code = code.replace(
  '<thead className="sticky top-0 z-10 bg-gray-100 dark:bg-[#1e1e1e] border-b border-kite-border text-kite-text-light uppercase tracking-wider">',
  '<thead className="sticky top-0 z-10 bg-gray-100 dark:bg-[#1e1e1e] border-b border-kite-border text-kite-text-light tracking-wider">'
);

code = code.replace(
  '<th colSpan={4} className="py-2 px-2 text-center border-r border-kite-border/50">Expect price (₹)</th>',
  '<th colSpan={4} className="py-2 px-2 text-center border-r border-kite-border/50">Expect Price (₹)</th>'
);

code = code.replace(
  '<th colSpan={4} className="py-2 px-2 text-center">Genetic Price(₹)</th>',
  '<th colSpan={4} className="py-2 px-2 text-center">Genetic Price (₹)</th>'
);

code = code.replace(
  '<th className="py-2 px-2 text-center border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]">STRIKE</th>',
  '<th className="py-2 px-2 text-center border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]">Strike</th>'
);

// Inner column headers for Option Chain
const oldOptionCols = `              <tr className="border-b border-kite-border/50 bg-white dark:bg-kite-surface">
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">OI</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Chng%</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">LTP</th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]"></th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">LTP</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Chng%</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal">OI</th>
              </tr>`;

const newOptionCols = `              <tr className="border-b border-kite-border/50 bg-white dark:bg-kite-surface">
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Oi</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Change %</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Ltp</th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]"></th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Ltp</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Change %</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal">Oi</th>
              </tr>`;

code = code.replace(oldOptionCols, newOptionCols);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard.tsx patched successfully!");
