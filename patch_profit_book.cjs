const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetStr = `                     }).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (business.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const liveProfit = inv.amount * (trend / 100);
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text">{formatINR(inv.amount).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatINR(ownerProfit).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">{liveProfit >= 0 ? "+" : "-"}{formatINR(Math.abs(liveProfit)).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-center text-kite-text-light">{inv.timePeriodMonths} Months</td>
                         <td className="py-4 pr-5 pl-4 text-right">
                           <span className={inv.status === "active" ? "text-[#4CAF50] uppercase text-[11px] font-medium tracking-wider" : "text-kite-text-light uppercase text-[11px] font-medium tracking-wider"}>
                             {inv.status}
                           </span>
                         </td>
                       </tr>
                     )
                   })}`;

const newStr = `                     }).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (business.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted ? 0 : inv.amount * (trend / 100);
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium \${isCompleted ? 'text-kite-blue' : 'text-kite-text'}\`}>{formatINR(inv.amount).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatINR(ownerProfit).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">
                           {isCompleted ? "-" : \`\${liveProfit >= 0 ? "+" : "-"}\${formatINR(Math.abs(liveProfit)).replace("₹", "")}\`}
                         </td>
                         <td className="py-4 px-4 text-center text-kite-text-light">{inv.timePeriodMonths} Months</td>
                         <td className="py-4 pr-5 pl-4 text-right">
                           <span className={inv.status === "active" ? "text-[#4CAF50] uppercase text-[11px] font-medium tracking-wider" : "text-kite-text-light uppercase text-[11px] font-medium tracking-wider"}>
                             {inv.status}
                           </span>
                         </td>
                       </tr>
                     )
                   })}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched completed investor styling in desktop table");
} else {
  console.log("Target string not found in BusinessDetail.tsx");
}
