import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

const startStr = "{/* Table Container */}\n          <div className=\"flex-1 overflow-auto\">\n            {activeTab === 'My Applications' ? (";
const endStr = "              </div>\n            )}\n          </div>";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newTable = `{/* Table Container */}
          <div className="flex-1 overflow-auto">
              <div className="min-w-[1000px]">
                <div className="flex items-center px-6 py-2 text-[11px] text-kite-text-light font-normal tracking-wide uppercase border-b border-kite-border-soft bg-kite-surface">
                  <div className="w-[18%]">Company</div>
                  <div className="w-[12%] text-right">Price Band</div>
                  <div className="w-[8%] text-right">Lot Size</div>
                  <div className="w-[12%] text-right">Min Inv.</div>
                  <div className="w-[10%] text-right">Open Date</div>
                  <div className="w-[10%] text-right">Close Date</div>
                  <div className="w-[10%] text-right">Listing Date</div>
                  <div className="w-[8%] text-center">Exchange</div>
                  <div className="w-[12%] text-right">Action</div>
                </div>
                
                {filteredIpos.length === 0 ? (
                  <div className="py-12 text-center text-kite-text-light text-[13px]">
                    No IPOs found in {activeTab} status.
                  </div>
                ) : (
                  filteredIpos.map(ipo => {
                    const hasApplied = applications.some((app: any) => app.ipoId === ipo.id);
                    return (
                    <div key={ipo.id} className="flex items-center px-6 py-3 text-[13px] border-b border-kite-border-soft hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors group">
                      <div className="w-[18%] font-medium text-kite-text truncate pr-2">{ipo.companyName} {hasApplied && <span className="ml-2 px-1.5 py-0.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded text-[9px] uppercase tracking-wider">Applied</span>}</div>
                      <div className="w-[12%] text-right text-kite-text-light">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</div>
                      <div className="w-[8%] text-right text-kite-text-light">{ipo.lotSize}</div>
                      <div className="w-[12%] text-right text-kite-text-light">{formatINR(ipo.minInvestment)}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.openDate}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.closeDate}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.listingDate}</div>
                      <div className="w-[8%] text-center text-kite-text-light">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2A2A] rounded text-[10px]">{ipo.exchange}</span>
                      </div>
                      <div className="w-[12%] flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(ipo)} className="text-kite-blue hover:underline text-[12px]">View</button>
                        {(ipo.status === 'Open' || ipo.status === 'Upcoming') && !hasApplied && (
                          <button onClick={() => handleApply(ipo)} className="bg-kite-blue text-white px-3 py-1 rounded-sm text-[12px] hover:bg-blue-600">Apply</button>
                        )}
                        {hasApplied && (
                          <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Applied</span>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>
          </div>`;
          
  content = content.substring(0, startIndex) + newTable + content.substring(endIndex);
  fs.writeFileSync('src/pages/Bids.tsx', content);
  console.log("Replaced table section successfully.");
} else {
  console.log("Could not find table container");
}
