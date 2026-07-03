import fs from 'fs';

const code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `                <div className="flex flex-col items-end">
                  {renderLiveAmount(b, "font-medium text-[13px]")}
                  <span className={\`text-[10px] font-medium mt-0.5 \${trendColor}\`}>
                    {b.overallTrend > 0 ? "+" : ""}{b.overallTrend.toFixed(2)}%
                  </span>
                </div>`;

const replacementStr = `                <div className="flex flex-col items-end">
                  <span className={\`font-medium text-[13px] \${trendColor}\`}>
                    {b.activeTotalInv === 0 ? formatINR(0) : formatINR(b.activeLiveTotalValue)}
                  </span>
                  <span className={\`text-[10px] font-medium mt-0.5 \${trendColor}\`}>
                    {b.overallTrend > 0 ? "+" : ""}{b.overallTrend.toFixed(2)}%
                  </span>
                </div>`;

if (code.includes(targetStr)) {
  const updatedCode = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/DataAnalysis.tsx', updatedCode);
  console.log("Success 3");
} else {
  console.log("Target string 3 not found!");
}
