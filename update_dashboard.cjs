const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Update React import
code = code.replace(
  'import React, { useState } from"react";', 
  'import React, { useState, useEffect, useMemo } from "react";'
);

const optionChainStateCode = `
  // --- Desktop Split Screen Logic ---
  const [desktopSelectedBusinessId, setDesktopSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (!desktopSelectedBusinessId && state.businesses.length > 0) {
      setDesktopSelectedBusinessId(state.businesses[0].id);
    }
  }, [state.businesses, desktopSelectedBusinessId]);

  const desktopSelectedBusiness = state.businesses.find(b => b.id === desktopSelectedBusinessId) || state.businesses[0];

  const [spotPrice, setSpotPrice] = useState(0);
  const [spotChange, setSpotChange] = useState(0);

  useEffect(() => {
    if (!desktopSelectedBusiness) return;
    const base = (desktopSelectedBusiness.name.length * 100) + 1250;
    setSpotPrice(base);
    setSpotChange(0);
    
    const interval = setInterval(() => {
      setSpotPrice(prev => {
        const change = (Math.random() - 0.45) * (base * 0.001); // slight bias
        const newPrice = prev + change;
        setSpotChange(((newPrice - base) / base) * 100);
        return newPrice;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [desktopSelectedBusiness]);

  const baseOptionsData = useMemo(() => {
    if (!desktopSelectedBusiness) return null;
    const base = (desktopSelectedBusiness.name.length * 100) + 1250;
    const step = 50;
    const atmStrike = Math.round(base / step) * step;
    const chain = [];
    
    for (let i = -12; i <= 12; i++) {
      const strike = atmStrike + (i * step);
      chain.push({
        strike,
        ceBaseVol: Math.floor(Math.random() * 100000) + 10000,
        ceBaseOi: Math.floor(Math.random() * 500000) + 50000,
        peBaseVol: Math.floor(Math.random() * 100000) + 10000,
        peBaseOi: Math.floor(Math.random() * 500000) + 50000,
      });
    }
    return { base, atmStrike, chain };
  }, [desktopSelectedBusiness]);

  const optionChain = useMemo(() => {
    if (!baseOptionsData || !spotPrice) return [];
    
    return baseOptionsData.chain.map(data => {
      const { strike, ceBaseVol, ceBaseOi, peBaseVol, peBaseOi } = data;
      
      const ceITM = strike < spotPrice;
      const peITM = strike > spotPrice;
      
      const ceIntrinsic = Math.max(0, spotPrice - strike);
      const peIntrinsic = Math.max(0, strike - spotPrice);
      
      const distanceFromAtm = Math.abs(strike - baseOptionsData.atmStrike) / 50;
      const timeValue = Math.max(1, 100 - (distanceFromAtm * 8));
      
      const cePrice = ceIntrinsic + timeValue + ((spotPrice % 1) * 2);
      const pePrice = peIntrinsic + timeValue + ((spotPrice % 1) * 2);
      
      const ceChange = spotChange * 2 * (1 - (distanceFromAtm * 0.05));
      const peChange = -spotChange * 2 * (1 - (distanceFromAtm * 0.05));

      return {
        strike,
        isAtm: strike === baseOptionsData.atmStrike,
        ce: {
          price: cePrice.toFixed(2),
          change: ceChange.toFixed(1),
          vol: ceBaseVol + Math.floor(spotPrice % 100),
          oi: ceBaseOi + Math.floor(spotPrice % 50),
          itm: ceITM
        },
        pe: {
          price: pePrice.toFixed(2),
          change: peChange.toFixed(1),
          vol: peBaseVol + Math.floor(spotPrice % 100),
          oi: peBaseOi + Math.floor(spotPrice % 50),
          itm: peITM
        }
      };
    });
  }, [baseOptionsData, spotPrice, spotChange]);
  
  // --- End Desktop Split Screen Logic ---
`;

const originalReturnStartIndex = code.lastIndexOf('return (\n  <div className="flex-1 overflow-auto bg-kite-bg">');
if (originalReturnStartIndex === -1) {
    console.error("Could not find main return statement");
    process.exit(1);
}

const beforeReturn = code.slice(0, originalReturnStartIndex);

const newReturnStatement = `return (
  <div className="flex-1 overflow-hidden bg-kite-bg flex flex-col h-full w-full">
    
    {/* MOBILE VIEW */}
    <div className="block md:hidden w-full h-full overflow-auto pb-[80px]">
      <div className="w-full">
        <div className="flex justify-between items-center p-4 border-b border-kite-border">
          <h1 className="text-[17px] font-medium text-kite-text uppercase">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-kite-border border-b border-kite-border bg-white dark:bg-kite-surface">
          {stats.map((stat, i) => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] text-kite-text-light uppercase tracking-wider">{stat.label}</p>
                  <p className="text-[20px] font-medium text-kite-text mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-4 h-4 text-kite-blue mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedBusiness && renderBusinessDetails(selectedBusiness)}
    </div>

    {/* DESKTOP VIEW */}
    <div className="hidden md:flex flex-col h-full w-full bg-white dark:bg-kite-surface">
      {/* Top 50% - Companies List */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-kite-surface">
        <div className="p-3 border-b border-kite-border flex items-center justify-between bg-gray-50 dark:bg-kite-bg">
          <h2 className="text-[13px] font-medium text-kite-text uppercase tracking-wider">Listed Companies</h2>
          <span className="text-[12px] text-kite-text-light">{state.businesses.length} Total</span>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="sticky top-0 bg-white dark:bg-kite-surface border-b border-kite-border/50 text-kite-text-light z-10">
              <tr>
                <th className="py-2 px-4 font-normal">Company</th>
                <th className="py-2 px-4 font-normal text-right">Owner</th>
                <th className="py-2 px-4 font-normal text-right">Funding Req.</th>
                <th className="py-2 px-4 font-normal text-right">Int. Rate</th>
                <th className="py-2 px-4 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kite-border/50">
              {state.businesses.map(b => (
                <tr 
                  key={b.id} 
                  onClick={() => setDesktopSelectedBusinessId(b.id)}
                  className={\`cursor-pointer transition-colors \${desktopSelectedBusinessId === b.id ? 'bg-kite-blue/5 dark:bg-kite-blue/10' : 'hover:bg-gray-50 dark:hover:bg-[#222222]'}\`}
                >
                  <td className="py-2.5 px-4 font-medium text-kite-blue">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{b.ownerName}</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{formatINR(b.fundingRequired)}</td>
                  <td className="py-2.5 px-4 text-right text-kite-text">{b.interestRate}%</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={\`px-2 py-0.5 rounded text-[11px] uppercase \${b.status === 'listed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}\`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Splitter */}
      <div className="h-[1px] w-full bg-kite-border shrink-0"></div>

      {/* Bottom 50% - Option Chain */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white dark:bg-kite-surface">
        <div className="p-3 border-b border-kite-border flex items-center justify-between bg-gray-50 dark:bg-kite-bg">
          <div className="flex items-center gap-4">
            <h2 className="text-[13px] font-medium text-kite-text uppercase tracking-wider">Option Chain</h2>
            <span className="text-[13px] font-medium text-kite-blue">{desktopSelectedBusiness?.name?.toUpperCase()}</span>
            <span className={\`text-[13px] font-medium flex items-center gap-1 \${spotChange >= 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#DF514C] dark:text-[#E25F5B]'}\`}>
              ₹{spotPrice.toFixed(2)} 
              <span className="text-[11px]">({spotChange >= 0 ? '+' : ''}{spotChange.toFixed(2)}%)</span>
            </span>
          </div>
          <div className="flex text-[11px] text-kite-text-light gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fdf5f2] dark:bg-[#4a2e2b]"></div> ITM Calls</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f4f7fa] dark:bg-[#203348]"></div> ITM Puts</span>
          </div>
        </div>
        
        {/* Option Chain Table */}
        <div className="flex-1 overflow-auto bg-white dark:bg-kite-surface">
          <table className="w-full text-[12px] text-right font-mono">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-[#1e1e1e] border-b border-kite-border text-kite-text-light uppercase tracking-wider">
              <tr>
                <th colSpan={4} className="py-2 px-2 text-center border-r border-kite-border/50">CALLS</th>
                <th className="py-2 px-2 text-center border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]">STRIKE</th>
                <th colSpan={4} className="py-2 px-2 text-center">PUTS</th>
              </tr>
              <tr className="border-b border-kite-border/50 bg-white dark:bg-kite-surface">
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">OI</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Chng%</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">LTP</th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50 bg-gray-50 dark:bg-[#181818]"></th>
                
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">LTP</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Chng%</th>
                <th className="py-1 px-2 font-normal border-r border-kite-border/50">Vol</th>
                <th className="py-1 px-2 font-normal">OI</th>
              </tr>
            </thead>
            <tbody>
              {optionChain.map((row, idx) => (
                <tr key={idx} className={\`border-b border-kite-border/20 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors \${row.isAtm ? 'border-y-2 border-y-kite-blue/30' : ''}\`}>
                  {/* Calls */}
                  <td className={\`py-1.5 px-2 border-r border-kite-border/20 \${row.ce.itm ? 'bg-[#fdf5f2] dark:bg-[#4a2e2b]/30' : ''}\`}>{row.ce.oi.toLocaleString()}</td>
                  <td className={\`py-1.5 px-2 border-r border-kite-border/20 \${row.ce.itm ? 'bg-[#fdf5f2] dark:bg-[#4a2e2b]/30' : ''}\`}>{row.ce.vol.toLocaleString()}</td>
                  <td className={\`py-1.5 px-2 border-r border-kite-border/20 \${Number(row.ce.change) > 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : Number(row.ce.change) < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : ''} \${row.ce.itm ? 'bg-[#fdf5f2] dark:bg-[#4a2e2b]/30' : ''}\`}>
                    {row.ce.change}%
                  </td>
                  <td className={\`py-1.5 px-2 font-medium border-r border-kite-border/50 \${row.ce.itm ? 'bg-[#fdf5f2] dark:bg-[#4a2e2b]/30' : ''}\`}>{row.ce.price}</td>
                  
                  {/* Strike */}
                  <td className="py-1.5 px-2 text-center font-bold bg-gray-50 dark:bg-[#181818] border-r border-kite-border/50 text-kite-text">{row.strike}</td>
                  
                  {/* Puts */}
                  <td className={\`py-1.5 px-2 font-medium border-r border-kite-border/20 \${row.pe.itm ? 'bg-[#f4f7fa] dark:bg-[#203348]/30' : ''}\`}>{row.pe.price}</td>
                  <td className={\`py-1.5 px-2 border-r border-kite-border/20 \${Number(row.pe.change) > 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : Number(row.pe.change) < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : ''} \${row.pe.itm ? 'bg-[#f4f7fa] dark:bg-[#203348]/30' : ''}\`}>
                    {row.pe.change}%
                  </td>
                  <td className={\`py-1.5 px-2 border-r border-kite-border/20 \${row.pe.itm ? 'bg-[#f4f7fa] dark:bg-[#203348]/30' : ''}\`}>{row.pe.vol.toLocaleString()}</td>
                  <td className={\`py-1.5 px-2 \${row.pe.itm ? 'bg-[#f4f7fa] dark:bg-[#203348]/30' : ''}\`}>{row.pe.oi.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
}
`;

fs.writeFileSync('src/pages/Dashboard.tsx', beforeReturn + optionChainStateCode + newReturnStatement);
console.log("Successfully updated Dashboard.tsx!");
