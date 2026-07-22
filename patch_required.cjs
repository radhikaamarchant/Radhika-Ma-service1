const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

content = content.replace(
  /<span>Required<\/span>\s*<span className="font-medium text-\[#4184F3\]">\s*₹\{getRawAmount\(formData\.amount\)\.toLocaleString\("en-IN", \{ maximumFractionDigits: 2 \}\)\} \+ \{calculateCommissions\(\)\.totalAdmin\.toLocaleString\("en-IN", \{ maximumFractionDigits: 2 \}\)\}\s*<\/span>/,
  `<span>{orderMode === "SELL" ? "Cap" : "Required"}</span>
                  <span className="font-medium text-[#4184F3]">
                    {orderMode === "SELL" ? (
                      <>
                        ₹{calculateSellStats().capUsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {calculateCommissions().totalAdmin.toLocaleString("en-IN", { maximumFractionDigits: 2 })} <span className="text-green-500 ml-2">Profit: ₹{calculateSellStats().profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                      </>
                    ) : (
                      <>
                        ₹{getRawAmount(formData.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {calculateCommissions().totalAdmin.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </>
                    )}
                  </span>`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched required text");
