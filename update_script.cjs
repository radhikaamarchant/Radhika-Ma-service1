const fs = require('fs');
let code = fs.readFileSync('src/utils/marketSimulator.ts', 'utf8');

const newCode = `
  let investorBonus = 0;
  let withdrawalPenalty = 0;

  if (business.increaseMarket !== undefined && business.downMarket !== undefined && business.triggerAmount) {
    let totalQtyActive = 0;
    activeInvs.forEach(i => {
      totalQtyActive += (i.quantity || Math.floor(i.amount / (business.triggerAmount || 1)));
    });

    let totalQtyClosed = 0;
    closedInvs.forEach(i => {
      totalQtyClosed += (i.quantity || Math.floor(i.amount / (business.triggerAmount || 1)));
    });

    investorBonus = totalQtyActive * business.increaseMarket;
    withdrawalPenalty = totalQtyClosed * business.downMarket;
  } else {
    const withdrawnAmount = closedInvs.reduce((sum, i) => {
      const p = i.payoutDetails;
      return sum + (p ? p.totalCredited : i.amount); // total credited includes profit
    }, 0);

    // If investors keep adding, it increases.
    const maxFundingNeeded =
      business.fundingRequired > 0 ? business.fundingRequired : 500000;
    const fundingRatio = activeAmount / maxFundingNeeded;

    // Bonus: e.g., 100% funded gives +10%. No cap means if they fund 200%, they get +20%.
    investorBonus = fundingRatio * 10;

    // If someone takes profit, it goes down.
    // But we want it to recover naturally so it doesn't just stay down.
    const totalAmountEverInvested =
      activeAmount + closedInvs.reduce((s, i) => s + i.amount, 0);
    const withdrawalRatio =
      totalAmountEverInvested > 0 ? withdrawnAmount / totalAmountEverInvested : 0;

    // Penalty scaled based on how much was withdrawn.
    withdrawalPenalty = withdrawalRatio * 15;
  }
`;

const lines = code.split('\n');
const result = [...lines.slice(0, 43), newCode.trim(), ...lines.slice(65)].join('\n');
fs.writeFileSync('src/utils/marketSimulator.ts', result);
