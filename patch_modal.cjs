const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const multiplierStr = " * Math.max(1, formData.investorIds.length)";

code = code.replace(
  /\{\s*formatINR\(\s*\(\s*getRawAmount\(formData\.amount\)\s*\*\s*parseFloat\(\s*formData\.adminCommissionBusinessPct,?\s*\)\s*\)\s*\/\s*100\s*,?\s*\)\s*\}/g,
  `{formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionBusinessPct)) / 100)${multiplierStr})}`
);

code = code.replace(
  /\{\s*formatINR\(\s*\(\s*getRawAmount\(formData\.amount\)\s*\*\s*parseFloat\(\s*formData\.adminCommissionInvestorPct,?\s*\)\s*\)\s*\/\s*100\s*,?\s*\)\s*\}/g,
  `{formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionInvestorPct)) / 100)${multiplierStr})}`
);

const oldSellTotal = `₹{calculateSellStats().capUsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {calculateCommissions().totalAdmin.toLocaleString("en-IN", { maximumFractionDigits: 2 })} <span className="text-[#4CAF50] dark:text-[#5B9A5D] ml-2">Profit: ₹{calculateSellStats().profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>`;
const newSellTotal = `₹{(calculateSellStats().capUsed * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {(calculateCommissions().totalAdmin * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} <span className="text-[#4CAF50] dark:text-[#5B9A5D] ml-2">Profit: ₹{(calculateSellStats().profit * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>`;
code = code.replace(oldSellTotal, newSellTotal);

const oldBuyTotal = `₹{getRawAmount(formData.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {calculateCommissions().totalAdmin.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const newBuyTotal = `₹{(getRawAmount(formData.amount) * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {(calculateCommissions().totalAdmin * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
code = code.replace(oldBuyTotal, newBuyTotal);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log("Patched AddInvestmentModal.tsx UI calculations");
