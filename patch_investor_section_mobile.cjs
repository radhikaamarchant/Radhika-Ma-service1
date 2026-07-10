const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetSection = `             <div className="divide-y divide-kite-border-soft md:hidden">
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

const newSection = `             <div className="divide-y divide-kite-border-soft md:hidden">
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).map((inv, idx) => {
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
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).length === 0 && (
                 <div className="p-6 text-center text-kite-text-light text-[13px] font-normal">
                   No investors found.
                 </div>
               )}
             </div>`;

if (content.includes('Owner profit: {formatINR(ownerProfit)}</p>')) {
  content = content.replace(targetSection, newSection);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Reverted mobile section");
