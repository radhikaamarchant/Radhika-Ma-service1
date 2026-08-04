const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `  const statsMap = getVerificationStats(state.businesses, state.investments);

  // Business Analytics Details`;

const replacement = `  const statsMap = getVerificationStats(state.businesses, state.investments);

  // --- Desktop City View Logic ---
  const cities = Array.from(new Set(state.investors.map((i: any) => i.address?.city?.toLowerCase()?.trim()).filter(Boolean))).sort() as string[];
  
  useEffect(() => {
    if (!selectedCity && cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity]);

  const cityInvestors = state.investors.filter((i: any) => i.address?.city?.toLowerCase()?.trim() === selectedCity);
  const cityInvestorIds = new Set(cityInvestors.map((i: any) => i.id));
  const cityInvestments = state.investments.filter((inv: any) => cityInvestorIds.has(inv.investorId));
  const cityBusinessIds = Array.from(new Set(cityInvestments.map((inv: any) => inv.businessId)));
  const cityBusinesses = state.businesses.filter((b: any) => cityBusinessIds.includes(b.id));

  const cityBusinessStats = cityBusinesses.map((b: any) => {
    const bizInvs = cityInvestments.filter((inv: any) => inv.businessId === b.id);
    const totalInvested = bizInvs.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    return { ...b, totalInvested, bizInvs };
  }).sort((a: any, b: any) => b.totalInvested - a.totalInvested);
  // --- End Desktop City View Logic ---

  // Business Analytics Details`;

if (code.includes(targetStr)) {
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(targetStr, replacement));
    console.log("Patched correctly");
} else {
    // Try matching single newline
    const altTargetStr = `  const statsMap = getVerificationStats(state.businesses, state.investments);\n  // Business Analytics Details`;
    if (code.includes(altTargetStr)) {
        fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(altTargetStr, replacement));
        console.log("Patched correctly with single newline");
    } else {
        console.log("Target string not found!");
    }
}
