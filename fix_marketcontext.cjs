const fs = require('fs');

let content = fs.readFileSync('src/utils/MarketSimulationContext.tsx', 'utf-8');

const target = `import { getBaseMarketTrend } from"./marketSimulator";`;
const replacement = `import { getBaseMarketTrend, getCurrentMarketPrice } from"./marketSimulator";`;
content = content.replace(target, replacement);

const loopTarget = `        businesses.forEach((b) => {
          const isBlueTick = blueTickIds.has(b.id);
          const currentBase = getBaseMarketTrend(
            b,
            investments,
            isBlueTick,
            alignedNow,
          );
          let hash = 0;
          for (let i = 0; i < b.id.length; i++) {
            hash = (hash << 5) - hash + b.id.charCodeAt(i);
            hash |= 0;
          }
          const timeBlock = Math.floor(alignedNow / 2000);
          const x = Math.sin(hash ^ timeBlock) * 10000;
          const fluctuation = (x - Math.floor(x)) * 2 - 1; // +/- 1% deterministic noise
          const newValue = currentBase + fluctuation;
          newTrends[b.id] = newValue;`;

const loopReplacement = `        businesses.forEach((b) => {
          let newValue;
          if (b.triggerAmount && b.triggerAmount > 0) {
            const currentPrice = getCurrentMarketPrice(b, investments);
            const absoluteDiff = currentPrice - b.triggerAmount;
            newValue = (absoluteDiff / b.triggerAmount) * 100;
          } else {
            const isBlueTick = blueTickIds.has(b.id);
            const currentBase = getBaseMarketTrend(
              b,
              investments,
              isBlueTick,
              alignedNow,
            );
            let hash = 0;
            for (let i = 0; i < b.id.length; i++) {
              hash = (hash << 5) - hash + b.id.charCodeAt(i);
              hash |= 0;
            }
            const timeBlock = Math.floor(alignedNow / 2000);
            const x = Math.sin(hash ^ timeBlock) * 10000;
            const fluctuation = (x - Math.floor(x)) * 2 - 1; // +/- 1% deterministic noise
            newValue = currentBase + fluctuation;
          }
          newTrends[b.id] = newValue;`;

content = content.replace(loopTarget, loopReplacement);

fs.writeFileSync('src/utils/MarketSimulationContext.tsx', content);
console.log("Fixed MarketSimulationContext.tsx");
