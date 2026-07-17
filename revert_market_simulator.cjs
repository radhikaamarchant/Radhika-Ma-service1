const fs = require('fs');
let code = fs.readFileSync('src/utils/marketSimulator.ts', 'utf8');

// We want to replace the `let investorBonus = 0; ... } else { ... }` block I introduced earlier.
const matchStart = code.indexOf('let investorBonus = 0;');
const matchEnd = code.indexOf('// 3. Blue tick business gives a boost');

if (matchStart !== -1 && matchEnd !== -1) {
  const originalBlock = `
  const withdrawnAmount = closedInvs.reduce((sum, i) => {
    const p = i.payoutDetails;
    return sum + (p ? p.totalCredited : i.amount); // total credited includes profit
  }, 0);

  // If investors keep adding, it increases.
  const maxFundingNeeded =
    business.fundingRequired > 0 ? business.fundingRequired : 500000;
  const fundingRatio = activeAmount / maxFundingNeeded;

  // Bonus: e.g., 100% funded gives +10%. No cap means if they fund 200%, they get +20%.
  const investorBonus = fundingRatio * 10;

  // If someone takes profit, it goes down.
  // But we want it to recover naturally so it doesn't just stay down.
  const totalAmountEverInvested =
    activeAmount + closedInvs.reduce((s, i) => s + i.amount, 0);
  const withdrawalRatio =
    totalAmountEverInvested > 0 ? withdrawnAmount / totalAmountEverInvested : 0;

  // Penalty scaled based on how much was withdrawn.
  const withdrawalPenalty = withdrawalRatio * 15;
`;

  code = code.substring(0, matchStart) + originalBlock + '\\n  ' + code.substring(matchEnd);
  fs.writeFileSync('src/utils/marketSimulator.ts', code);
}
