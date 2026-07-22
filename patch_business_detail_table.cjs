const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

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
                         <td className="!py-[10px] !px-[12px] text-[#444444] dark:text-[#BBBBBB] font-medium whitespace-nowrap capitalize !text-[14px]">
                           {investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right font-mono font-medium !text-[14px] text-[#444444] dark:text-[#BBBBBB]">
                           {formatCompactZerodha(inv.amount)}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right font-mono font-medium text-[#4CAF50] dark:text-[#5B9A5D] !text-[14px]">
                           {\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}
                         </td>
                         <td className={\`!py-[10px] !px-[12px] text-right font-mono font-medium !text-[14px] \${isCompleted ? 'text-[#FF5722] dark:text-[#D4603B]' : 'text-[#444444] dark:text-[#BBBBBB]'}\`}>
                           {formatCompactZerodha(ownerProfit)}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-center text-[#444444] dark:text-[#BBBBBB] !text-[14px]">
                           {qty}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right !text-[14px]">
                           <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize font-medium tracking-wider" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize font-medium tracking-wider"}>
                             {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
                           </span>
                         </td>
                       </tr>
                     )`;

if (code.includes(oldMapBody)) {
    code = code.replace(oldMapBody, newMapBody);
    console.log("Desktop table updated.");
} else {
    console.log("Could not find desktop table body text.");
}

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
                        <p className="text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="text-[12px] text-[#444444] dark:text-[#BBBBBB] mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
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
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="!py-[10px] !px-[12px] flex justify-between items-center">
                      <div>
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="!text-[12px] text-[#444444] dark:text-[#BBBBBB] mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] font-mono">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="!text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] font-mono mt-0.5">{\`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}</p>
                      </div>
                   </div>
                 )`;

if (code.includes(oldMobileMap)) {
    code = code.replace(oldMobileMap, newMobileMap);
    console.log("Mobile view updated.");
} else {
    console.log("Could not find mobile view text.");
}

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
