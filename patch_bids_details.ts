import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

content = content.replace(
  "<DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} />",
  "<DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} applications={applications} saveApplications={saveApplications} commissions={commissions} saveCommissions={saveCommissions} />"
);

// We need to replace the DetailsModal signature and body
const detailsFuncRegex = /function DetailsModal\(\{[^\}]+\}: any\) \{[\s\S]*?\}\s*function ApplyModal/m;

const newDetailsFunc = `function DetailsModal({ ipo, onClose, onApply, applications, saveApplications, commissions, saveCommissions }: any) {
  const myApp = applications?.find((a: any) => a.ipoId === ipo.id);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-kite-bg w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-kite-border-soft">
           <div>
             <h2 className="text-[18px] font-medium text-kite-text">{ipo.companyName}</h2>
             <p className="text-[12px] text-kite-text-light">{ipo.exchange} • {ipo.status}</p>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#202020] rounded"><X className="w-5 h-5 text-kite-text-light" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-[13px]">
           
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 rounded border border-kite-border-soft flex items-center justify-center bg-gray-50 dark:bg-[#2A2A2A] text-lg font-bold text-kite-text-light">
                {ipo.companyName.charAt(0)}
             </div>
             <div>
               <p className="text-[14px] font-medium text-kite-text">{ipo.companyName}</p>
               <p className="text-[12px] text-kite-text-light">Industry: {ipo.industry || 'N/A'} • Registrar: {ipo.registrar || 'N/A'}</p>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6 mb-8 border-b border-kite-border-soft pb-8">
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Issue Size</p>
               <p className="text-[14px] font-medium text-kite-text">{ipo.issueSize ? \`₹\${ipo.issueSize} Cr\` : 'TBD'}</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Price Band</p>
               <p className="text-[14px] font-medium text-kite-text">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Lot Size</p>
               <p className="text-[14px] font-medium text-kite-text">{ipo.lotSize} shares</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Min Investment</p>
               <p className="text-[14px] font-medium text-kite-text">₹{ipo.minInvestment}</p>
             </div>
           </div>
           
           {ipo.description && (
             <div className="mb-8">
               <h3 className="text-[14px] font-medium text-kite-text mb-2">Company Description</h3>
               <p className="text-kite-text-light text-[13px] leading-relaxed">{ipo.description}</p>
             </div>
           )}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <h3 className="text-[14px] font-medium text-kite-text mb-4">IPO Timeline</h3>
               <div className="space-y-4">
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Bidding Starts</span>
                   <span className="text-kite-text font-medium">{ipo.openDate || 'TBD'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Bidding Ends</span>
                   <span className="text-kite-text font-medium">{ipo.closeDate || 'TBD'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Listing Date</span>
                   <span className="text-kite-text font-medium">{ipo.listingDate || 'TBD'}</span>
                 </div>
               </div>
             </div>
             
             {myApp && (
               <div>
                 <h3 className="text-[14px] font-medium text-kite-text mb-4">My Application</h3>
                 <div className="bg-blue-50/50 dark:bg-blue-900/5 border border-kite-border-soft p-4 rounded space-y-3">
                   <div className="flex justify-between">
                     <span className="text-kite-text-light">Application Date</span>
                     <span className="text-kite-text">{new Date(myApp.applicationDate).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-kite-text-light">Lots Applied</span>
                     <span className="text-kite-text">{myApp.lotsApplied} (₹{myApp.appliedAmount})</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-kite-text-light">Allotment Status</span>
                     <span className="text-kite-text font-medium">{myApp.allotmentStatus}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-kite-text-light">Listing Status</span>
                     <span className="text-kite-text font-medium">{myApp.listingStatus}</span>
                   </div>
                   {myApp.listingStatus !== 'Exited' && (
                      <button 
                         onClick={() => {
                          const exitAmount = myApp.appliedAmount;
                          const commissionAmount = exitAmount * 0.01;
                          
                          const newApps = applications.map((a: any) => a.id === myApp.id ? { ...a, listingStatus: 'Exited' } : a);
                          saveApplications(newApps as any);
                          
                          const newComm = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'Exit',
                            ipoId: ipo.id,
                            investorId: myApp.investorId,
                            amount: commissionAmount,
                            date: new Date().toISOString()
                          };
                          saveCommissions([...commissions, newComm] as any);
                          alert(\`Exited successfully! 1% commission (₹\${commissionAmount.toFixed(2)}) charged.\`);
                        }} 
                         className="w-full mt-2 bg-kite-red text-white px-3 py-2 rounded-sm text-[12px] hover:bg-red-600 transition-colors"
                      >
                        Exit / Sell / Unapply
                      </button>
                    )}
                 </div>
               </div>
             )}
           </div>
           
        </div>
        <div className="p-4 border-t border-kite-border-soft flex justify-end gap-3 bg-gray-50 dark:bg-kite-surface shrink-0">
           {ipo.prospectusPdf && (
              <a href={ipo.prospectusPdf} target="_blank" rel="noreferrer" className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-white dark:hover:bg-[#202020] text-kite-blue flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Prospectus
              </a>
           )}
           <button onClick={onClose} className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-white dark:hover:bg-[#202020]">Close</button>
           {(ipo.status === 'Open' || ipo.status === 'Upcoming') && !myApp && (
             <button onClick={onApply} className="px-5 py-2 bg-kite-blue text-white rounded-sm text-[13px] font-medium hover:bg-blue-600">Apply for IPO</button>
           )}
        </div>
      </div>
    </div>
  );
}

function ApplyModal`;

if (content.match(detailsFuncRegex)) {
  content = content.replace(detailsFuncRegex, newDetailsFunc);
  fs.writeFileSync('src/pages/Bids.tsx', content);
  console.log("DetailsModal updated.");
} else {
  console.log("Could not find DetailsModal to replace");
}
