import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Replace the applications map inside DetailsModal
old_apps_render = r'\{myApps\.map\(\(myApp: any\) => \([\s\S]*?</div>\s*\)\)\}'

new_apps_render = '''{myApps.map((myApp: any) => {
                     const isBlocked = myApp.applicationStatus === 'Active' && myApp.allotmentStatus === 'Pending';
                     const isRefunded = myApp.applicationStatus === 'Cancelled' || myApp.allotmentStatus === 'Not Allotted';
                     const isTransferred = myApp.allotmentStatus === 'Allotted';
                     
                     let moneyStatus = 'Applied';
                     if (isBlocked) moneyStatus = 'Blocked in Escrow';
                     else if (isRefunded) moneyStatus = 'Refunded to Available Balance';
                     else if (isTransferred) moneyStatus = 'Transferred to Company';
                     
                     return (
                     <div key={myApp.id} className="bg-blue-50/50 dark:bg-blue-900/5 border border-kite-border-soft p-4 rounded space-y-3">
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Application Date</span>
                         <span className="text-kite-text font-medium">{new Date(myApp.applicationDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Applied Lots</span>
                         <span className="text-kite-text font-medium">{myApp.lotsApplied}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">IPO Amount</span>
                         <span className="text-kite-text font-medium">₹{myApp.appliedAmount.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Platform Fee (1%)</span>
                         <span className="text-kite-text font-medium">₹{(myApp.commissionPaid || 0).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Total Paid</span>
                         <span className="text-kite-text font-medium">₹{(myApp.appliedAmount + (myApp.commissionPaid || 0)).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Blocked Amount</span>
                         <span className="text-kite-text font-medium">₹{isBlocked ? myApp.appliedAmount.toLocaleString('en-IN') : '0'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Application Status</span>
                         <span className="text-kite-text font-medium">{myApp.applicationStatus || 'Active'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Allotment Status</span>
                         <span className="text-kite-text font-medium">{myApp.allotmentStatus}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Refund Status</span>
                         <span className="text-kite-text font-medium">{myApp.refundStatus}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Listing Status</span>
                         <span className="text-kite-text font-medium">{myApp.listingStatus}</span>
                       </div>
                       <div className="mt-4 pt-3 border-t border-kite-border-soft flex justify-between items-center">
                         <span className="text-[11px] text-kite-text-light uppercase tracking-wider">Funds Location</span>
                         <span className="text-[12px] font-medium bg-kite-bg px-2 py-1 rounded">{moneyStatus}</span>
                       </div>
                       
                       {ipo.status === 'Open' && myApp.applicationStatus !== 'Cancelled' && (
                          <button 
                             onClick={() => {
                              const newApps = applications.map((a: any) => a.id === myApp.id ? { ...a, applicationStatus: 'Cancelled', refundStatus: 'Refunded' } : a);
                              saveApplications(newApps as any);
                              alert(`Application Cancelled!\\n\\n₹${myApp.appliedAmount.toLocaleString('en-IN')} has been unblocked and returned to your Available Balance.\\nPlatform Commission is non-refundable.`);
                            }} 
                             className="w-full mt-2 border border-kite-red text-kite-red px-3 py-2 rounded-sm text-[12px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                          >
                            Cancel Application
                          </button>
                       )}
                       
                       {ipo.status === 'Listed' && myApp.allotmentStatus === 'Allotted' && (
                          <button 
                             onClick={() => {
                               // Just an info message since prompt says selling is from Holdings page
                               alert("Please go to the Investments page to View or Sell your Holdings.");
                             }} 
                             className="w-full mt-2 bg-kite-blue text-white px-3 py-2 rounded-sm text-[12px] hover:bg-blue-600 transition-colors font-medium"
                          >
                            View Holdings
                          </button>
                       )}
                     </div>
                   );
                   })}'''

content = re.sub(old_apps_render, new_apps_render, content)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
print("Updated DetailsModal in Bids.tsx")
