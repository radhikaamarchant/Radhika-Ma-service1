const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace the live fluctuation logic with exact matching logic
const oldLogic = `  // Calculate prices for the Option Chain based on the selected company's ACTUAL price
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
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);`;

const newLogic = `  // Calculate prices for the Option Chain based on the selected company's ACTUAL price
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
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard logic updated for strict alignment!");
