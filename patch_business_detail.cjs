const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// Section 1: Summary Section Updates
code = code.replace(
  /<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal">Total funded<\/p>\s*<p className="text-\[18px\] md:text-\[20px\] font-normal text-kite-text">\{formatINR\(totalFunded\)\.replace\("₹", ""\)\}<\/p>/g,
  `<p className="text-[13px] md:text-[14px] text-kite-text font-normal capitalize">Total Funded (₹)</p>
             <p className="text-[16px] font-normal text-kite-text">{formatINR(totalFunded).replace("₹", "")}</p>`
);

code = code.replace(
  /<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal">Total profit pay<\/p>\s*<p className="text-\[18px\] md:text-\[20px\] font-normal text-kite-text">\{formatINR\(totalProfitPay\)\.replace\("₹", ""\)\}<\/p>/g,
  `<p className="text-[13px] md:text-[14px] text-kite-text font-normal capitalize">Total Profit Pay (-₹)</p>
             <p className="text-[16px] font-normal text-kite-text">{formatINR(totalProfitPay).replace("₹", "")}</p>`
);

code = code.replace(
  /<p className="text-\[13px\] md:text-\[14px\] text-kite-text font-normal">Investors<\/p>\s*<p className="text-\[18px\] md:text-\[20px\] font-normal text-kite-text">\{activeBusinessInvestments\.length\}<\/p>/g,
  `<p className="text-[13px] md:text-[14px] text-kite-text font-normal capitalize">Investor</p>
             <p className="text-[16px] font-normal text-kite-text">{activeBusinessInvestments.length}</p>`
);

// Section 2: Table Title
code = code.replace(
  /<h3 className="text-\[14px\] font-normal text-kite-text-light uppercase tracking-wider">Current investors<\/h3>/g,
  `<h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider">Available Investor</h3>`
);

// Section 3: Table Headers
const oldHeaders = `<thead className="border-b-2 border-black dark:border-kite-border font-medium uppercase text-[11px] md:text-[12px] tracking-wider text-kite-text">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48">Investor Name</th>
                     <th className="py-4 px-4 text-right">Amount</th>
                     <th className="py-4 px-4 text-right">Owner Profit</th>
                     <th className="py-4 px-4 text-right">Live Profit</th>
                     <th className="py-4 px-4 text-center">Period</th>
                     <th className="py-4 pr-5 pl-4 text-right">Status</th>
                   </tr>
                 </thead>`;

const newHeaders = `<thead className="border-b-2 border-black dark:border-kite-border font-medium capitalize tracking-wider text-kite-text">
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

// Section 4: Table Row logic
const oldTbodyStart = `<tbody className="divide-y divide-kite-border-soft text-[13px] md:text-[14px]">`;
const newTbodyStart = `<tbody className="divide-y divide-kite-border-soft text-[14px]">`;
code = code.replace(oldTbodyStart, newTbodyStart);

const oldMapBody = `}).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (inv.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted ? 0 : inv.amount * (trend / 100);
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium \${isCompleted ? 'text-kite-blue' : 'text-kite-text'}\`}>{formatCompactZerodha(inv.amount)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatCompactZerodha(ownerProfit)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50] dark:text-[#5B9A5D]">
                           {isCompleted ? "-" : \`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}
                         </td>
                         <td className="py-4 px-4 text-center text-kite-text-light">{inv.timePeriodMonths} Months</td>
                         <td className="py-4 pr-5 pl-4 text-right">
                           <span className={inv.status === "active" ? "text-[#4CAF50] dark:text-[#5B9A5D] uppercase text-[11px] font-medium tracking-wider" : "text-kite-text-light uppercase text-[11px] font-medium tracking-wider"}>
                             {inv.status}
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

code = code.replace(oldMapBody, newMapBody);


// Now for the mobile view
const oldMobileMap = `}).map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const profit = (inv.amount * (inv.interestRate || 0)) / 100;
                 return (
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{investor?.name || "Unknown"}</p>
                        <p className="text-[12px] md:text-[13px] text-kite-text-light mt-0.5">{inv.timePeriodMonths} Months • <span className={inv.status === "active" ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-kite-text-light"}>{inv.status}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] md:text-[13px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] mt-0.5">+{formatINR(profit).replace("₹", "")}</p>
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
                        <p className="text-[14px] font-normal text-kite-text capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="text-[12px] text-kite-text-light mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#4CAF50] dark:text-[#5B9A5D] capitalize" : "text-kite-text-light capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-normal text-kite-text font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] font-mono mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>
                   </div>
                 )`;

code = code.replace(oldMobileMap, newMobileMap);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
console.log("Done.");
