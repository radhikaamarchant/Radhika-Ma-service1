const fs = require('fs');
let content = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf-8');

const target1 = `            const currentPrice = getCurrentMarketPrice(b, state.investments);
            const originalPrice = b.triggerAmount || 100;
            const absoluteDiff = currentPrice - originalPrice;
            const percentageChange = originalPrice > 0 ? (absoluteDiff / originalPrice) * 100 : 0;
            const isUp = percentageChange >= 0;
            const trendColor = isUp ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]";`;

const repl1 = `            const currentPrice = getCurrentMarketPrice(b, state.investments);
            const originalPrice = b.triggerAmount || 100;
            const absoluteDiff = currentPrice - originalPrice;
            const percentageChange = b.overallTrend;
            const isUp = percentageChange >= 0;
            const trendColor = isUp ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]";`;

content = content.replace(target1, repl1);

fs.writeFileSync('src/pages/DataAnalysis.tsx', content);
console.log("Fixed DataAnalysis");
