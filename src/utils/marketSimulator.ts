import { useState, useEffect } from"react";
import { Business, Investment } from"../types";

export function getBaseMarketTrend(
  business: Business | undefined,
  investments: Investment[],
  isBlueTick: boolean = false,
  overrideNow?: number,
): number {
  if (!business) return 0;

  const hashString = business.id;
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = (hash << 5) - hash + hashString.charCodeAt(i);
    hash |= 0;
  }

  const now = overrideNow || Date.now();
  // 1 cycle every 5 minutes (300,000 ms) so it goes up and down throughout the day
  const cycleMs = 300000;
  const offset = Math.abs(hash) % cycleMs;

  // Create a continuous wave
  const wave1 = Math.sin(((now + offset) / cycleMs) * Math.PI * 2);
  const wave2 = Math.cos(((now + offset * 2) / (cycleMs * 1.5)) * Math.PI * 2);

  // Combine waves, range is roughly -2 to +2
  const combinedWave = wave1 + wave2;

  // 1. The baseline is the interest rate chosen by the company
  const baseRate = business.interestRate || 0;

  // 2. We analyze investment data to dynamically boost or penalize.
  const safeInvestments = investments || [];
  const activeInvs = safeInvestments.filter(
    (i) => i.businessId === business.id && i.status ==="active",
  );
  const activeAmount = activeInvs.reduce((sum, i) => sum + i.amount, 0);

  const closedInvs = safeInvestments.filter(
    (i) => i.businessId === business.id && i.status ==="completed",
  );

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
  // 3. Blue tick business gives a boost
  const blueTickBonus = isBlueTick ? 5 : 0;
  const amplitude = isBlueTick ? 12 : 25; // Blue ticks have tighter noise

  // Market noise based on the wave
  const marketNoise = (combinedWave / 2) * amplitude; // -12 to +12 or -25 to +25

  const calculatedTrend =
    baseRate + investorBonus - withdrawalPenalty + blueTickBonus + marketNoise;

  return calculatedTrend;
}
