import fs from 'fs';

const code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `    return {
      ...b,
      totalInv,
      liveTotalValue,
      overallTrend,
      totalRet,`;

const replacementStr = `    return {
      ...b,
      totalInv,
      liveTotalValue,
      activeTotalInv,
      activeLiveTotalValue,
      overallTrend,
      totalRet,`;

if (code.includes(targetStr)) {
  const updatedCode = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/DataAnalysis.tsx', updatedCode);
  console.log("Success 2");
} else {
  console.log("Target string 2 not found!");
}
