const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('getCurrentMarketPrice')) {
    code = code.replace(
        'import { getUnifiedBankBalance } from"../utils/bankBalance";',
        'import { getUnifiedBankBalance } from"../utils/bankBalance";\nimport { getCurrentMarketPrice } from"../utils/marketSimulator";'
    );
}

// First, fix the Desktop View container to have overflow-hidden so it fits 50/50 exactly
code = code.replace(
    '<div className="hidden md:flex flex-col h-full w-full bg-white dark:bg-kite-surface">',
    '<div className="hidden md:flex flex-col h-full w-full bg-white dark:bg-kite-surface overflow-hidden">'
);

const newLogic = `
  // --- Desktop Split Screen Logic ---
  const [desktopSelectedBusinessId, setDesktopSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (!desktopSelectedBusinessId && state.businesses.length > 0) {
      setDesktopSelectedBusinessId(state.businesses[0].id);
    }
  }, [state.businesses, desktopSelectedBusinessId]);

  const desktopSelectedBusiness = state.businesses.find(b => b.id === desktopSelectedBusinessId) || state.businesses[0];

  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(prev => prev + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Calculate prices for the Option Chain based on the selected company's ACTUAL price
  const { spotPrice, spotChange, percentageChange } = useMemo(() => {
    if (!desktopSelectedBusiness) return { spotPrice: 0, spotChange: 0, percentageChange: 0 };
    const basePrice = getCurrentMarketPrice(desktopSelectedBusiness, state.investments);
    const originalPrice = desktopSelectedBusiness.triggerAmount || 100;
    
    // Add a tiny random live fluctuation for effect
    const tickFluctuation = (Math.random() - 0.5) * (basePrice * 0.002);
    const livePrice = basePrice + tickFluctuation;
    
    const absoluteDiff = livePrice - originalPrice;
    
    const baseTrend = marketState.trends[desktopSelectedBusiness.id] ?? desktopSelectedBusiness.interestRate ?? 0;
    const livePct = baseTrend + (tickFluctuation / originalPrice * 100);
    
    return { spotPrice: livePrice, spotChange: absoluteDiff, percentageChange: livePct };
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);

  const baseOptionsData = useMemo(() => {
    if (!desktopSelectedBusiness || !spotPrice) return null;
    const base = spotPrice;
    
    let step = 10;
    if (base > 500) step = 50;
    if (base > 2000) step = 100;
    if (base > 10000) step = 500;
    
    const atmStrike = Math.round(base / step) * step;
    const chain = [];
    
    for (let i = -10; i <= 10; i++) {
      const strike = atmStrike + (i * step);
      chain.push({
        strike,
        ceBaseVol: Math.floor(Math.random() * 50000) + 10000,
        ceBaseOi: Math.floor(Math.random() * 200000) + 20000,
        peBaseVol: Math.floor(Math.random() * 50000) + 10000,
        peBaseOi: Math.floor(Math.random() * 200000) + 20000,
      });
    }
    return { base, atmStrike, chain, step };
  }, [desktopSelectedBusiness]);

  const optionChain = useMemo(() => {
    if (!baseOptionsData || !spotPrice) return [];
    
    return baseOptionsData.chain.map(data => {
      const { strike, ceBaseVol, ceBaseOi, peBaseVol, peBaseOi } = data;
      const step = baseOptionsData.step;
      
      const ceITM = strike < spotPrice;
      const peITM = strike > spotPrice;
      
      const ceIntrinsic = Math.max(0, spotPrice - strike);
      const peIntrinsic = Math.max(0, strike - spotPrice);
      
      const distanceFromAtm = Math.abs(strike - baseOptionsData.atmStrike) / step;
      const timeValue = Math.max(0.5, (step * 2) - (distanceFromAtm * (step * 0.3)));
      
      const cePrice = ceIntrinsic + timeValue + ((spotPrice % 1) * (step * 0.02));
      const pePrice = peIntrinsic + timeValue + ((spotPrice % 1) * (step * 0.02));
      
      const ceChange = percentageChange * 2 * (1 - (distanceFromAtm * 0.05));
      const peChange = -percentageChange * 2 * (1 - (distanceFromAtm * 0.05));

      return {
        strike,
        isAtm: strike === baseOptionsData.atmStrike,
        ce: {
          price: cePrice.toFixed(2),
          change: ceChange.toFixed(2),
          vol: ceBaseVol + Math.floor(spotPrice % 100),
          oi: ceBaseOi + Math.floor(spotPrice % 50),
          itm: ceITM
        },
        pe: {
          price: pePrice.toFixed(2),
          change: peChange.toFixed(2),
          vol: peBaseVol + Math.floor(spotPrice % 100),
          oi: peBaseOi + Math.floor(spotPrice % 50),
          itm: peITM
        }
      };
    });
  }, [baseOptionsData, spotPrice, percentageChange]);
  // --- End Desktop Split Screen Logic ---
`;

const startIndex = code.indexOf('// --- Desktop Split Screen Logic ---');
const endIndex = code.indexOf('// --- End Desktop Split Screen Logic ---') + '// --- End Desktop Split Screen Logic ---'.length;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newLogic + code.substring(endIndex);
} else {
    console.log("Could not find logic block!");
}

const oldTableHeader = `              <tr>
                <th className="py-2 px-4 font-normal">Company</th>
                <th className="py-2 px-4 font-normal text-right">Owner</th>
                <th className="py-2 px-4 font-normal text-right">Funding Req.</th>
                <th className="py-2 px-4 font-normal text-right">Int. Rate</th>
                <th className="py-2 px-4 font-normal text-right">Status</th>
              </tr>`;
              
const newTableHeader = `              <tr>
                <th className="py-2 px-4 font-normal">Company</th>
                <th className="py-2 px-4 font-normal text-right">LTP</th>
                <th className="py-2 px-4 font-normal text-right">Change %</th>
                <th className="py-2 px-4 font-normal text-right">Funding Req.</th>
                <th className="py-2 px-4 font-normal text-right">Int. Rate</th>
                <th className="py-2 px-4 font-normal text-right">Status</th>
              </tr>`;

code = code.replace(oldTableHeader, newTableHeader);

const tbodyRegex = /<tbody className="divide-y divide-kite-border\/50">([\s\S]*?)<\/tbody>/;
const newTbodyContent = `
              {state.businesses.map(b => {
                const bPrice = getCurrentMarketPrice(b, state.investments);
                const bTrend = marketState.trends[b.id] ?? b.interestRate ?? 0;
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

const oldOptionChainHeaderInfo = `            <span className={\`text-[13px] font-medium flex items-center gap-1 \${spotChange >= 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#DF514C] dark:text-[#E25F5B]'}\`}>
              ₹{spotPrice.toFixed(2)} 
              <span className="text-[11px]">({spotChange >= 0 ? '+' : ''}{spotChange.toFixed(2)}%)</span>
            </span>`;
            
const newOptionChainHeaderInfo = `            <span className={\`text-[13px] font-medium flex items-center gap-1 \${percentageChange >= 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#DF514C] dark:text-[#E25F5B]'}\`}>
              ₹{spotPrice.toFixed(2)} 
              <span className="text-[11px]">({spotChange >= 0 ? '+' : ''}{spotChange.toFixed(2)} / {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%)</span>
            </span>`;

code = code.replace(oldOptionChainHeaderInfo, newOptionChainHeaderInfo);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard.tsx patched successfully!");
