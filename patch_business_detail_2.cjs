const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// Section 1: Summary Section Updates
code = code.replace(
  /<div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">\s*<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal capitalize">Total Funded \(₹\)<\/p>\s*<p className="text-\[16px\] font-normal text-kite-text">\{formatINR\(totalFunded\)\.replace\("₹", ""\)\}<\/p>\s*<\/div>/g,
  `<div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex items-center justify-start gap-2">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Funded (₹)</p>
             <p className="text-[16px] font-normal text-[#4CAF50] dark:text-[#5B9A5D]">{formatINR(totalFunded).replace("₹", "")}</p>
          </div>`
);

code = code.replace(
  /<div className="hidden md:flex bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft justify-between items-center">\s*<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal capitalize">Total Profit Pay \(-₹\)<\/p>\s*<p className="text-\[16px\] font-normal text-kite-text">\{formatINR\(totalProfitPay\)\.replace\("₹", ""\)\}<\/p>\s*<\/div>/g,
  `<div className="hidden md:flex bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft justify-start gap-2 items-center">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Profit Pay (-₹)</p>
             <p className="text-[16px] font-normal text-[#E25F5B] dark:text-[#E25F5B]">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>`
);

code = code.replace(
  /<div className="md:hidden bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">\s*<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal capitalize">Total Profit Pay \(-₹\)<\/p>\s*<p className="text-\[16px\] font-normal text-kite-text">\{formatINR\(totalProfitPay\)\.replace\("₹", ""\)\}<\/p>\s*<\/div>/g,
  `<div className="md:hidden bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-start gap-2 items-center">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Profit Pay (-₹)</p>
             <p className="text-[16px] font-normal text-[#E25F5B] dark:text-[#E25F5B]">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>`
);

code = code.replace(
  /<div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">\s*<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal capitalize">Investor<\/p>\s*<p className="text-\[16px\] font-normal text-kite-text">\{activeBusinessInvestments\.length\}<\/p>\s*<\/div>/g,
  `<div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex items-center justify-start gap-2">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Investor</p>
             <p className="text-[16px] font-normal text-[#4987EE] dark:text-[#4987EE]">{activeBusinessInvestments.length}</p>
          </div>`
);

// Section 2: Table Headers (Titles)
const oldHeaders = `<thead className="border-b-2 border-black dark:border-kite-border font-medium capitalize tracking-wider text-kite-text">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48 text-[12px]">Investor Name</th>
                     <th className="py-4 px-4 text-right text-[12px]">Equity Amount (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">Margin (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">My Profit (₹)</th>
                     <th className="py-4 px-4 text-center text-[12px]">Qty.</th>
                     <th className="py-4 pr-5 pl-4 text-right text-[12px]">Holding</th>
                   </tr>
                 </thead>`;

const newHeaders = `<thead className="border-b-2 border-black dark:border-kite-border font-medium capitalize tracking-wider text-[#9B9B9B] dark:text-[#666666]">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48 text-[12px]">Investor Name</th>
                     <th className="py-4 px-4 text-right text-[12px]">Equity Amount (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">Margin (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">My Profit (₹)</th>
                     <th className="py-4 px-4 text-center text-[12px]">Qty.</th>
                     <th className="py-4 pr-5 pl-4 text-right text-[12px]">Holding</th>
                   </tr>
                 </thead>`;

code = code.replace(oldHeaders, newHeaders);

// Section 3 & 4: Table Body & Rows Data Condition Colors
const oldMapBody = `}).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (inv.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted 
                        ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                        : (inv.amount * (trend / 100));
                     const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                     
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap capitalize text-[14px]">
                           {investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}
                         </td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium text-[14px] \${isCompleted ? 'text-kite-blue' : 'text-kite-text'}\`}>
                           {formatCompactZerodha(inv.amount)}
                         </td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50] dark:text-[#5B9A5D] text-[14px]">
                           {\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}
                         </td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light text-[14px]">
                           {formatCompactZerodha(ownerProfit)}
                         </td>
                         <td className="py-4 px-4 text-center text-kite-text-light text-[14px]">
                           {qty}
                         </td>
                         <td className="py-4 pr-5 pl-4 text-right text-[14px]">
                           <span className={inv.status === "active" ? "text-[#4CAF50] dark:text-[#5B9A5D] capitalize font-medium tracking-wider" : "text-kite-text-light capitalize font-medium tracking-wider"}>
                             {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
                           </span>
                         </td>
                       </tr>
                     )`;

const newMapBody = `}).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (inv.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted 
                        ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                        : (inv.amount * (trend / 100));
                     const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                     
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-[#444444] dark:text-[#BBBBBB] font-medium whitespace-nowrap capitalize text-[14px]">
                           {investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}
                         </td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[14px] text-[#444444] dark:text-[#BBBBBB]">
                           {formatCompactZerodha(inv.amount)}
                         </td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50] dark:text-[#5B9A5D] text-[14px]">
                           {\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}
                         </td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium text-[14px] \${isCompleted ? 'text-[#FF5722] dark:text-[#D4603B]' : 'text-[#444444] dark:text-[#BBBBBB]'}\`}>
                           {formatCompactZerodha(ownerProfit)}
                         </td>
                         <td className="py-4 px-4 text-center text-[#444444] dark:text-[#BBBBBB] text-[14px]">
                           {qty}
                         </td>
                         <td className="py-4 pr-5 pl-4 text-right text-[14px]">
                           <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize font-medium tracking-wider" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize font-medium tracking-wider"}>
                             {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
                           </span>
                         </td>
                       </tr>
                     )`;

code = code.replace(oldMapBody, newMapBody);


// Mobile view
const oldMobileMap = `}).map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const trend = marketTrends[businessId] || 0;
                 const isCompleted = inv.status === "completed";
                 const liveProfit = isCompleted 
                    ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                    : (inv.amount * (trend / 100));
                 const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                 return (
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] font-normal text-kite-text capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="text-[12px] text-kite-text-light mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#4CAF50] dark:text-[#5B9A5D] capitalize" : "text-kite-text-light capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-normal text-kite-text font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] font-mono mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>
                   </div>
                 )`;

const newMobileMap = `}).map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const trend = marketTrends[businessId] || 0;
                 const isCompleted = inv.status === "completed";
                 const liveProfit = isCompleted 
                    ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                    : (inv.amount * (trend / 100));
                 const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                 return (
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="text-[12px] text-[#444444] dark:text-[#BBBBBB] mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] font-mono mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>
                   </div>
                 )`;

code = code.replace(oldMobileMap, newMobileMap);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
console.log("Done.");
