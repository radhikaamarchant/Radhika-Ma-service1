const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Fix 1: Inv Impect (%) - strict investor count ratio
const oldInvImpactLogic = `
                // Inv Impect (%)
                const baseImpact = b.fundingRequired > 0 ? (totalInv / b.fundingRequired) * 100 : 0;
                const invImpactFluctuation = (baseImpact < 100 && baseImpact > 0) ? Math.sin((liveTick + hash) * 0.5) * 1.5 : 0;
                const invImpact = Math.min(100, Math.max(0, baseImpact + invImpactFluctuation));`;

const newInvImpactLogic = `
                // Inv Impect (%) based on strict ratio of investors
                const distinctInvestors = new Set(bizInvs.map(i => i.investorId)).size;
                const totalPlatformInvestors = state.investors.length || 1;
                const calculatedImpact = (distinctInvestors / totalPlatformInvestors) * 100;
                const invImpact = distinctInvestors === totalPlatformInvestors ? 100 : Math.min(99.99, calculatedImpact);`;

code = code.replace(oldInvImpactLogic, newInvImpactLogic);


// Fix 2: Change % logic matching the sidebar
const oldLiveFluctuatedPrice = `
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

const newLiveFluctuatedPrice = `
  const getLiveFluctuatedPrice = (b: any, basePrice: number, tick: number) => {
    if (!b) return { livePrice: 0, liveTrend: 0 };
    
    const livePrice = basePrice;
    const originalPrice = b.triggerAmount || 100;
    
    // Strictly compute percentage based on price difference, exactly like the Left Sidebar
    const absoluteChange = livePrice - originalPrice;
    const liveTrend = originalPrice > 0 ? (absoluteChange / originalPrice) * 100 : 0;
    
    return { livePrice, liveTrend };
  };`;

code = code.replace(oldLiveFluctuatedPrice, newLiveFluctuatedPrice);

// In the option chain calculation, we also need to ensure spotChange and percentageChange are matching
const oldSpotChangeLogic = `
  const { spotPrice, spotChange, percentageChange } = useMemo(() => {
    if (!desktopSelectedBusiness) return { spotPrice: 0, spotChange: 0, percentageChange: 0 };
    const basePrice = getCurrentMarketPrice(desktopSelectedBusiness, state.investments);
    const { livePrice, liveTrend } = getLiveFluctuatedPrice(desktopSelectedBusiness, basePrice, liveTick);
    
    const originalPrice = desktopSelectedBusiness.triggerAmount || 100;
    const absoluteDiff = livePrice - originalPrice;
    
    return { spotPrice: livePrice, spotChange: absoluteDiff, percentageChange: liveTrend };
  }, [desktopSelectedBusiness, state.investments, marketState.trends, liveTick]);`;

const newSpotChangeLogic = `
  const { spotPrice, spotChange, percentageChange } = useMemo(() => {
    if (!desktopSelectedBusiness) return { spotPrice: 0, spotChange: 0, percentageChange: 0 };
    const basePrice = getCurrentMarketPrice(desktopSelectedBusiness, state.investments);
    
    // Read directly from the base price logic
    const originalPrice = desktopSelectedBusiness.triggerAmount || 100;
    const absoluteDiff = basePrice - originalPrice;
    const pctChange = originalPrice > 0 ? (absoluteDiff / originalPrice) * 100 : 0;
    
    return { spotPrice: basePrice, spotChange: absoluteDiff, percentageChange: pctChange };
  }, [desktopSelectedBusiness, state.investments]);`;

code = code.replace(oldSpotChangeLogic, newSpotChangeLogic);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard updated with exact requirements");
