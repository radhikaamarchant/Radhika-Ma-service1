import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# Define active bids apps
active_bids_logic = '''
            // Active IPO apps (Not listed, not cancelled, not refunded)
            const activeBidsApps = bidsApps.filter((a: any) => 
               a.applicationStatus !== 'Cancelled' && 
               a.allotmentStatus !== 'Not Allotted' && 
               a.listingStatus !== 'Listed'
            );
            
            // History IPO apps (Refunded/Cancelled)
            const historyBidsApps = bidsApps.filter((a: any) => 
               a.applicationStatus === 'Cancelled' || 
               a.allotmentStatus === 'Not Allotted'
            );
'''

# We inject this right after we calculate bidsApps
injection_point = '''            const savedIpos = localStorage.getItem("bids_ipos");
            const allIpos = savedIpos ? JSON.parse(savedIpos) : [];'''

content = content.replace(injection_point, injection_point + active_bids_logic)

# For Desktop Holdings (Active)
# Let's find the closing table tag for Desktop Holdings
desktop_holdings_end = '''                              );
                            })}
                          </tbody>
                        </table>'''

desktop_active_ipo_render = '''                              );
                            })}
                          </tbody>
                        </table>
                        {activeBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6 border-t border-kite-border">
                          <thead className="bg-white dark:bg-kite-surface border-b border-kite-border text-kite-text-light">
                            <tr>
                              <th className="font-normal py-3 px-4 md:px-6 w-[30%]">ACTIVE IPO</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[20%]">AMOUNT</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[30%]">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBidsApps.map((app: any) => {
                               const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                               let displayStatus = 'IPO APPLIED';
                               if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';
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
                                      <span className="text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium bg-kite-blue/10 text-kite-blue">
                                        {displayStatus}
                                      </span>
                                   </td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                        )}'''
# Replace the FIRST occurrence of desktop_holdings_end (which is in Holdings tab)
# Oh wait, we already added desktop_ipo_render which might look similar.
# Let's use re.sub with count=1

content = content.replace(desktop_holdings_end, desktop_active_ipo_render, 1)

# For Mobile Holdings (Active)
# Let's find the closing div of holdings map
mobile_holdings_end = '''                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>'''

mobile_active_ipo_render = '''                                  </div>
                                </div>
                              );
                            })}
                            
                          {/* Active IPO Apps on Mobile */}
                          {activeBidsApps.map((app: any) => {
                             const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                             let displayStatus = 'IPO APPLIED';
                             if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                             return (
                              <div key={app.id} className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                   <div className="flex items-center gap-1.5">
                                      <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                         {ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}
                                      </h3>
                                   </div>
                                   <div className="text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium bg-kite-blue/10 text-kite-blue">
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
                        </>'''

content = content.replace(mobile_holdings_end, mobile_active_ipo_render, 1)

# Now fix the Positions (History) to ONLY use historyBidsApps
# In patch_investors_history.py I used `bidsApps.map`. I will change it to `historyBidsApps.map`
content = content.replace('{bidsApps.length > 0 && (', '{historyBidsApps.length > 0 && (')
content = content.replace('{bidsApps.map((app: any) => {', '{historyBidsApps.map((app: any) => {')


with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)
