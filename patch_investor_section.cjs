const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetSection = `          <div className="bg-white dark:bg-kite-surface pt-2 border-b border-kite-border-soft mt-4">
             <h3 className="px-5 py-3 text-[14px] font-normal text-kite-text-light border-b border-kite-border-soft uppercase tracking-wider">Current investors</h3>
             <div className="hidden md:block overflow-x-auto w-full max-w-full">
               <table className="w-full text-left text-[13px] md:text-[14px] min-w-[700px]">
                 <thead className="border-b-2 border-black dark:border-kite-border font-medium uppercase text-[11px] md:text-[12px] tracking-wider text-kite-text">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48">Investor Name</th>
                     <th className="py-4 px-4 text-right">Amount</th>
                     <th className="py-4 px-4 text-right">Profit</th>
                     <th className="py-4 px-4 text-center">Period</th>
                     <th className="py-4 pr-5 pl-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-kite-border-soft text-[13px] md:text-[14px]">
                   {businessInvestments.map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const profit = (inv.amount * (business.interestRate || 0)) / 100;
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap">{investor?.name || "Unknown"}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text">{formatINR(inv.amount).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">{formatINR(profit).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-center text-kite-text-light">{inv.timePeriodMonths} Months</td>
                         <td className="py-4 pr-5 pl-4 text-right">
                           <span className={inv.status === "active" ? "text-[#4CAF50] uppercase text-[11px] font-medium tracking-wider" : "text-kite-text-light uppercase text-[11px] font-medium tracking-wider"}>
                             {inv.status}
                           </span>
                         </td>
                       </tr>
                     )
                   })}
                   {businessInvestments.length === 0 && (
                     <tr><td colSpan={5} className="py-12 text-center text-kite-text-light font-medium">No investors found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             <div className="divide-y divide-kite-border-soft md:hidden">
               {businessInvestments.map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const profit = (inv.amount * (business.interestRate || 0)) / 100;
                 return (
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{investor?.name || "Unknown"}</p>
                        <p className="text-[12px] md:text-[13px] text-kite-text-light mt-0.5">{inv.timePeriodMonths} Months • <span className={inv.status === "active" ? "text-[#4CAF50]" : "text-kite-text-light"}>{inv.status}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] md:text-[13px] font-medium text-[#4CAF50] mt-0.5">+{formatINR(profit).replace("₹", "")}</p>
                      </div>
                   </div>
                 )
               })}
               {businessInvestments.length === 0 && (
                 <div className="p-6 text-center text-kite-text-light text-[13px] font-normal">
                   No investors found.
                 </div>
               )}
             </div>`;

const newSection = `          <div className="bg-white dark:bg-kite-surface pt-2 border-b border-kite-border-soft mt-4">
             <div className="px-5 py-3 border-b border-kite-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
               <h3 className="text-[14px] font-normal text-kite-text-light uppercase tracking-wider">Current investors</h3>
               <input
                 type="text"
                 placeholder="Search investor..."
                 value={investorSearchQuery}
                 onChange={(e) => setInvestorSearchQuery(e.target.value)}
                 className="w-full md:w-64 border border-kite-border-hard rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-kite-blue"
               />
             </div>
             
             <div className="hidden md:block overflow-x-auto w-full max-w-full">
               <table className="w-full text-left text-[13px] md:text-[14px] min-w-[800px]">
                 <thead className="border-b-2 border-black dark:border-kite-border font-medium uppercase text-[11px] md:text-[12px] tracking-wider text-kite-text">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48">Investor Name</th>
                     <th className="py-4 px-4 text-right">Amount</th>
                     <th className="py-4 px-4 text-right">Owner Profit</th>
                     <th className="py-4 px-4 text-right">Live Profit</th>
                     <th className="py-4 px-4 text-center">Period</th>
                     <th className="py-4 pr-5 pl-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-kite-border-soft text-[13px] md:text-[14px]">
                   {businessInvestments.filter(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
                   }).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (business.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const liveProfit = inv.amount * (trend / 100);
                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap">{investor?.name || "Unknown"}</td>
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
                   })}
                   {businessInvestments.filter(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
                   }).length === 0 && (
                     <tr><td colSpan={6} className="py-12 text-center text-kite-text-light font-medium">No investors found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             <div className="divide-y divide-kite-border-soft md:hidden">
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const ownerProfit = (inv.amount * (business.interestRate || 0)) / 100;
                 const trend = marketTrends[businessId] || 0;
                 const liveProfit = inv.amount * (trend / 100);
                 return (
                   <div key={\`biz_inv_mob_\${inv.id}_\${idx}\`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{investor?.name || "Unknown"}</p>
                        <p className="text-[12px] md:text-[13px] text-kite-text-light mt-0.5">{inv.timePeriodMonths} Months • <span className={inv.status === "active" ? "text-[#4CAF50]" : "text-kite-text-light"}>{inv.status}</span></p>
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">Owner profit: {formatINR(ownerProfit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] md:text-[13px] font-medium text-[#4CAF50] mt-0.5">{liveProfit >= 0 ? "+" : "-"}{formatINR(Math.abs(liveProfit)).replace("₹", "")}</p>
                      </div>
                   </div>
                 )
               })}
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).length === 0 && (
                 <div className="p-6 text-center text-kite-text-light text-[13px] font-normal">
                   No investors found.
                 </div>
               )}
             </div>`;

if (content.includes('Current investors</h3>')) {
  content = content.replace(targetSection, newSection);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched Current Investors section");
