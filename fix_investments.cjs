const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// The block around 448
let target1 = `            const pnlPercentage = isCompleted
              ? (holdingProfit / inv.amount) * 100
              : overallTrend;`;

let repl1 = `            const pnlPercentage = (holdingProfit / inv.amount) * 100;`;
content = content.replace(target1, repl1);

// Inside the selectedInvestment view (LivePortfolioDetail) it also uses overallTrend
// Let's check line 1667
let target2 = `                        <span
                          className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium" +
                            (overallTrend >= 0
                              ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/$1 text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"bg-[#FCEBEB] dark:bg-[#E25F5B]/$1 text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {overallTrend >= 0 ?"+" :""}{""}
                          {overallTrend.toFixed(2)}%{""}
                        </span>`;

// The actual pnl of the selected investment is calculated above line 1667? Let's check what variables are available.
fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Fixed first part of Investments.tsx");
