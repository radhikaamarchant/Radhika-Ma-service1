const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetStats = `  const hpgStats = useMemo(() => {
    if (!business) return { investors: 0, totalProfit: 0, totalLoss: 0, highProfit: 0, details: [] };
    const businessInvestments = state.investments.filter(inv => inv.businessId === business.id);
    const uniqueInvestors = new Set(businessInvestments.map(inv => inv.investorId));
    let totalProfit = 0;
    let totalLoss = 0;
    let highProfit = 0;
    const details: any[] = [];
    
    businessInvestments.forEach(inv => {
      if (inv.status === "completed" && inv.payoutDetails) {
        const netProfit = inv.payoutDetails.totalCredited - inv.amount;
        if (netProfit > 0) {
           totalProfit += netProfit;
           if (netProfit > inv.amount * 0.5) highProfit += netProfit; 
        } else {
           totalLoss += Math.abs(netProfit);
        }
        details.push({
           investorId: inv.investorId,
           investorName: state.investors.find(i => i.id === inv.investorId)?.name || "Unknown",
           amount: inv.amount,
           netProfit,
           date: inv.endDate || inv.startDate
        });
      }
    });
    return { investors: uniqueInvestors.size, totalProfit, totalLoss, highProfit, details };
  }, [state.investments, business, state.investors]);`;

const injectStats = `  const hpgStats = useMemo(() => {
    if (!business) return { investors: 0, totalProfit: 0, totalLoss: 0, highProfit: 0, details: [], companyNet: 0, activeDetails: [], pastInvestorsCount: 0 };
    const businessInvestments = state.investments.filter(inv => inv.businessId === business.id);
    const uniqueInvestors = new Set(businessInvestments.map(inv => inv.investorId));
    let totalProfit = 0;
    let totalLoss = 0;
    let highProfit = 0;
    let companyTotalIn = 0;
    let companyTotalOut = 0;
    const details: any[] = [];
    const activeDetails: any[] = [];
    const pastInvestorsSet = new Set();
    
    businessInvestments.forEach(inv => {
      if (inv.status === "completed" && inv.payoutDetails) {
        pastInvestorsSet.add(inv.investorId);
        companyTotalIn += inv.amount;
        const out = inv.payoutDetails.totalCredited + (inv.payoutDetails.rmasCommission || 0) + (inv.payoutDetails.happyIncomeTax || 0) - (inv.payoutDetails.rmasSubsidyPays || 0);
        companyTotalOut += out;
        
        const netProfit = inv.payoutDetails.totalCredited - inv.amount;
        if (netProfit > 0) {
           totalProfit += netProfit;
           if (netProfit > inv.amount * 0.5) highProfit += netProfit; 
        } else {
           totalLoss += Math.abs(netProfit);
        }
        details.push({
           investorId: inv.investorId,
           investorName: state.investors.find(i => i.id === inv.investorId)?.name || "Unknown",
           amount: inv.amount,
           netProfit,
           date: inv.endDate || inv.startDate
        });
      } else {
        activeDetails.push({
           investorId: inv.investorId,
           investorName: state.investors.find(i => i.id === inv.investorId)?.name || "Unknown",
           amount: inv.amount,
           date: inv.startDate
        });
      }
    });
    return { 
      investors: uniqueInvestors.size, 
      totalProfit, 
      totalLoss, 
      highProfit, 
      details,
      companyNet: companyTotalIn - companyTotalOut,
      activeDetails,
      pastInvestorsCount: pastInvestorsSet.size
    };
  }, [state.investments, business, state.investors]);`;

code = code.replace(targetStats, injectStats);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
