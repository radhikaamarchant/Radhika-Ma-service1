const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const listsPattern = /const topInvested = \[\.\.\.businessesWithStats\][\s\S]*?const overviewBusinesses = \[\.\.\.businessesWithStats\][\s\S]*?\}\);/m;

const replacementLists = `const topInvested = isDesktop
    ? [...businessesWithStats]
        .filter((b) => b.totalInv > 0)
        .sort((a, b) => b.totalInv - a.totalInv)
        .slice(0, 10)
    : [...businessesWithStats]
        .filter((b) => b.totalInv > 0)
        .sort((a, b) => b.liveTotalValue - a.liveTotalValue)
        .slice(0, 10);

  const topBacked = isDesktop
    ? [...businessesWithStats]
        .filter((b) => b.totalInv > 0 && b.totalRet > b.totalInv * 0.05)
        .sort((a, b) => (b.totalRet / b.totalInv) - (a.totalRet / a.totalInv))
        .slice(0, 10)
    : [...businessesWithStats]
        .filter((b) => b.investorCount > 0)
        .sort((a, b) => b.investorCount - a.investorCount)
        .slice(0, 10);

  const topEarners = [...businessesWithStats]
    .filter((b) => b.totalRet > 0)
    .sort((a, b) => b.totalRet - a.totalRet)
    .slice(0, 10);

  const untappedBusinesses = businessesWithStats.filter(
    (b) => b.totalInv === 0,
  );

  const newlyListed = [...businessesWithStats]
    .filter((b) => b.totalInv < b.fundingRequired * 0.5)
    .reverse()
    .slice(0, 8);

  const bestMarket = isDesktop
    ? businessesWithStats
        .filter((b) => b.totalInv > 0 && b.totalRet > 0 && (b.downMarket || 0) > 0 && (b.increaseMarket || 0) > 0)
        .sort((a, b) => b.totalRet - a.totalRet)
    : businessesWithStats
        .filter((b) => b.overallTrend >= b.interestRate + 10)
        .sort((a, b) => b.overallTrend - a.overallTrend);

  const sortedByInvForMed = [...businessesWithStats].filter(b => b.totalInv > 0 && b.totalRet > 0).sort((a,b) => b.totalInv - a.totalInv);
  const medStartIndex = Math.max(0, Math.floor(sortedByInvForMed.length / 2) - 3);
  const mediumBusinesses = isDesktop
    ? sortedByInvForMed.slice(medStartIndex, medStartIndex + 6)
    : [];

  const overviewBusinesses = [...businessesWithStats]
    .filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.businessId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy ==="investment") {
        return b.liveTotalValue - a.liveTotalValue;
      }
      return a.interestRate - b.interestRate;
    });`;

code = code.replace(listsPattern, replacementLists);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
