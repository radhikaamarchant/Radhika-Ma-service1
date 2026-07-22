const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// The chunk in Value Overview:
const oldValOverview = `<div className="flex flex-col gap-5 mt-2">
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Invested</span>
                <span className="text-[14px] text-kite-text font-mono">{formatCompactZerodha(allTimeInvestedAmount)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Active Invested</span>
                <span className="text-[14px] text-kite-text font-mono">{formatCompactZerodha(totalFunded)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Highest Inv.</span>
                <span className="text-[14px] text-kite-text font-mono">{formatCompactZerodha(maxInvestment)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Lowest Inv.</span>
                <span className="text-[14px] text-kite-text font-mono">{formatCompactZerodha(minInvestment)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Profit Taken Out</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D] font-mono">
                  {formatCompactZerodha(profitTakenOut)} 
                  <span className="text-[11px] text-kite-text-light font-sans ml-1">({allTimeInvestedAmount > 0 ? ((profitTakenOut/allTimeInvestedAmount)*100).toFixed(1) : 0}%)</span>
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Profit Given</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D] font-mono">`;

const newValOverview = `<div className="flex flex-col gap-5 mt-2">
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Invested</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(allTimeInvestedAmount)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Active Invested</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(totalFunded)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Highest Inv.</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(maxInvestment)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Lowest Inv.</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(minInvestment)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Profit Taken Out</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">
                  {formatCompactZerodha(profitTakenOut)} 
                  <span className="text-[11px] text-kite-text-light font-sans ml-1">({allTimeInvestedAmount > 0 ? ((profitTakenOut/allTimeInvestedAmount)*100).toFixed(1) : 0}%)</span>
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Profit Given</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">`;

code = code.replace(oldValOverview, newValOverview);

// Are there other font-mono in mobile views?
// Line 1010 and 1011
const oldMobInv = `<div className="text-right">
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="!text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] font-mono mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>`;

const newMobInv = `<div className="text-right">
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB]">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="!text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>`;
code = code.replace(oldMobInv, newMobInv);

// Lines 1039, 1043
const oldBankDetails = `<div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Account Number</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text font-mono tracking-wider">{business.bankDetails.accountNumber}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">IFSC</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text font-mono tracking-wider">{business.bankDetails.ifscCode}</p>
                </div>`;
const newBankDetails = `<div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Account Number</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text tracking-wider">{business.bankDetails.accountNumber}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">IFSC</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text tracking-wider">{business.bankDetails.ifscCode}</p>
                </div>`;

code = code.replace(oldBankDetails, newBankDetails);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
console.log("Replaced");
