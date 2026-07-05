import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# Add a block right before rendering the positions list on desktop and mobile.
# Actually, let's inject `bidsApps` processing in the `const InvestorDetail = ...` component?
# The code has `const positions = Object.entries(groupedCompleted).map(...)`.

injection_code = '''            const positions = Object.entries(groupedCompleted).map(
              ([bizId, invs]) => {
                const business = state.businesses.find((b) => b.id === bizId);
                let investedAmount = 0;
                (invs as Investment[]).forEach((inv: any) => {
                  investedAmount += inv.amount;
                });
                return { bizId, business, invs, investedAmount };
              },
            );

            // Fetch IPO Applications from localStorage
            const savedBidsApps = localStorage.getItem("bids_applications");
            const bidsApps = savedBidsApps ? JSON.parse(savedBidsApps).filter((a: any) => a.investorId === selectedInvestor.id) : [];
            const savedIpos = localStorage.getItem("bids_ipos");
            const allIpos = savedIpos ? JSON.parse(savedIpos) : [];
'''

content = content.replace('''            const positions = Object.entries(groupedCompleted).map(
              ([bizId, invs]) => {
                const business = state.businesses.find((b) => b.id === bizId);
                let investedAmount = 0;
                (invs as Investment[]).forEach((inv: any) => {
                  investedAmount += inv.amount;
                });
                return { bizId, business, invs, investedAmount };
              },
            );''', injection_code)

# Now, we inject the rendering of IPO applications in the Desktop Table for Positions.
desktop_table_end = '''                      </table>
                    </div>'''

desktop_ipo_render = '''
                      {bidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6">
                          <thead className="bg-white dark:bg-kite-surface border-y border-kite-border text-kite-text-light">
                            <tr>
                              <th className="font-normal py-3 px-4 md:px-6 w-[30%]">IPO APPLIED</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[20%]">AMOUNT</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[30%]">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bidsApps.map((app: any) => {
                               const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                               const isRefunded = app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted';
                               const isListed = app.listingStatus === 'Listed';
                               if (isListed) return null; // handled by normal investments

                               let displayStatus = 'IPO APPLIED';
                               if (isRefunded) displayStatus = 'REFUNDED';
                               else if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                               return (
                                 <tr key={app.id} className="border-b border-kite-border hover:bg-gray-50 dark:hover:bg-[#202020]">
                                   <td className="py-3 px-4 md:px-6">
                                     <div className="flex items-center gap-2">
                                       <span className="text-kite-text font-normal uppercase tracking-wide">{ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}</span>
                                     </div>
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal text-kite-text">
                                     {formatINR(app.appliedAmount).replace("₹", "")}
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal">
                                      <span className={`text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium ${isRefunded ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'bg-kite-blue/10 text-kite-blue'}`}>
                                        {displayStatus}
                                      </span>
                                   </td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                      )}
                      </table>
                    </div>'''
content = content.replace(desktop_table_end, desktop_ipo_render)

# Now, we inject the rendering of IPO applications in the Mobile List for Positions.
mobile_list_end = '''                          })}
                        </div>
                      )}
                    </div>'''

mobile_ipo_render = '''                          })}
                          
                          {/* IPO Apps on Mobile */}
                          {bidsApps.map((app: any) => {
                             const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                             const isRefunded = app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted';
                             const isListed = app.listingStatus === 'Listed';
                             if (isListed) return null;

                             let displayStatus = 'IPO APPLIED';
                             if (isRefunded) displayStatus = 'REFUNDED';
                             else if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                             return (
                              <div key={app.id} className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                   <div className="flex items-center gap-1.5">
                                      <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                         {ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}
                                      </h3>
                                   </div>
                                   <div className={`text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium ${isRefunded ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'bg-kite-blue/10 text-kite-blue'}`}>
                                     {displayStatus}
                                   </div>
                                </div>
                                <div className="flex justify-between items-center leading-tight">
                                   <div className="flex items-center text-[10px] md:text-[11px]">
                                     <span className="text-kite-text-light font-normal mr-1">Invested:</span>
                                     <span className="text-kite-text font-normal uppercase tracking-wide">{formatINR(app.appliedAmount).replace("₹", "")}</span>
                                   </div>
                                </div>
                              </div>
                             );
                          })}

                        </div>
                      )}
                    </div>'''

content = content.replace(mobile_list_end, mobile_ipo_render)

# Highlight IPO PROFIT
old_pnl_desktop = '''                                  <span className={`text-[13px] md:text-[14px] font-normal ${p.investedAmount === 0 ? "text-[#4CAF50]" : (totalProfit >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]")}`}>
                                    {totalProfit >= 0 ? "+" : ""}
                                    {formatINR(Math.abs(totalProfit)).replace("₹", "")}
                                  </span>'''
new_pnl_desktop = '''                                  <div className="flex flex-col items-end">
                                    <span className={`text-[13px] md:text-[14px] font-normal ${p.investedAmount === 0 ? "text-[#4CAF50]" : (totalProfit >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]")}`}>
                                      {totalProfit >= 0 ? "+" : ""}
                                      {formatINR(Math.abs(totalProfit)).replace("₹", "")}
                                    </span>
                                    {((p.invs as any)[0]?.id?.startsWith('inv_ipo_') && totalProfit > 0) && (
                                      <span className="text-[10px] text-kite-green font-medium uppercase tracking-widest mt-0.5">IPO Profit</span>
                                    )}
                                  </div>'''
content = content.replace(old_pnl_desktop, new_pnl_desktop)

with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)

