import { useState, useEffect } from 'react';

// Live continuous sine-wave based market trend that changes every second
export function getBaseMarketTrend(businessId: string, isBlueTick: boolean = false): number {
  const hashString = businessId;
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
    hash |= 0;
  }
  
  const now = Date.now();
  // 1 cycle every 5 minutes (300,000 ms) so it goes up and down throughout the day
  const cycleMs = 300000;
  const offset = Math.abs(hash) % cycleMs;
  
  // Create a continuous wave
  const wave1 = Math.sin((now + offset) / cycleMs * Math.PI * 2);
  const wave2 = Math.cos((now + offset * 2) / (cycleMs * 1.5) * Math.PI * 2);
  
  // Combine waves, range is roughly -2 to +2
  const combinedWave = wave1 + wave2; // -2 to +2

  // For blue tick businesses, they generally perform better. 
  // Map combinedWave to a range. 
  // Normal range: -30 to +45
  // Blue tick range: +5 to +60
  
  if (isBlueTick) {
    // Normalizing -2..2 to 5..60
    // +2 = 60, -2 = 5
    // center is 32.5, amplitude is 27.5
    return 32.5 + (combinedWave / 2) * 27.5;
  } else {
    // Normalizing -2..2 to -30..45
    // +2 = 45, -2 = -30
    // center is 7.5, amplitude is 37.5
    return 7.5 + (combinedWave / 2) * 37.5;
  }
}

export function useLiveMarketTrend(businessId: string, isBlueTick: boolean = false) {
  const [liveTrend, setLiveTrend] = useState(() => getBaseMarketTrend(businessId, isBlueTick));

  useEffect(() => {
    const interval = setInterval(() => {
      // Re-evaluate the sine wave every few seconds + add small random noise
      const currentBase = getBaseMarketTrend(businessId, isBlueTick);
      const fluctuation = (Math.random() * 2) - 1; // +/- 1% noise
      setLiveTrend(currentBase + fluctuation);
    }, 2000); // update every 2 seconds
    
    return () => clearInterval(interval);
  }, [businessId, isBlueTick]);

  return liveTrend;
}
