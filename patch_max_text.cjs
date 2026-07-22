const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const oldText = `<span className="ml-1.5 text-[#FF5722] dark:text-[#D4603B]">
                              (Max: {maxSellQty} Qty / ₹{Math.floor(maxSellAmount).toLocaleString("en-IN")})
                            </span>`;

const newText = `<span className="ml-1.5 text-[#FF5722] dark:text-[#D4603B]">
                              + Max: {maxSellQty} Qty
                            </span>`;

code = code.replace(oldText, newText);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
