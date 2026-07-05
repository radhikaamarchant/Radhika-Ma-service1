import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

// Replace the Tabs
content = content.replace("{(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed'] as const).map(tab => (", "{(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed', 'My Applications'] as const).map(tab => (");

// Add 'My Applications' to the type
content = content.replace("useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed'>('Open');", "useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed' | 'My Applications'>('Open');");

const myAppsUi = `
{activeTab === 'My Applications' ? (
  <div className="flex-1 overflow-auto">
    <div className="min-w-[1000px]">
      <div className="flex items-center px-6 py-2 text-[11px] text-kite-text-light font-normal tracking-wide uppercase border-b border-kite-border-soft bg-kite-surface">
        <div className="w-[15%]">Company</div>
        <div className="w-[12%] text-right">App. Date</div>
        <div className="w-[8%] text-right">Lots</div>
        <div className="w-[12%] text-right">Amount</div>
        <div className="w-[12%] text-center">App Status</div>
        <div className="w-[12%] text-center">Allotment</div>
        <div className="w-[12%] text-center">Listing</div>
        <div className="w-[17%] text-right">Action</div>
      </div>
      {applications.length === 0 ? (
        <div className="py-12 text-center text-kite-text-light text-[13px]">
          No IPO applications found.
        </div>
      ) : (
        applications.map(app => {
          const ipo = ipos.find(i => i.id === app.ipoId);
          if (!ipo) return null;
          return (
            <div key={app.id} className="flex items-center px-6 py-3 text-[13px] border-b border-kite-border-soft hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors group">
              <div className="w-[15%] font-medium text-kite-text truncate pr-2">{ipo.companyName}</div>
              <div className="w-[12%] text-right text-kite-text-light">{new Date(app.applicationDate).toLocaleDateString()}</div>
              <div className="w-[8%] text-right text-kite-text-light">{app.lotsApplied}</div>
              <div className="w-[12%] text-right text-kite-text-light">{formatINR(app.appliedAmount)}</div>
              <div className="w-[12%] text-center text-kite-text-light">
                <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/10 text-kite-blue rounded text-[10px]">Applied</span>
              </div>
              <div className="w-[12%] text-center text-kite-text-light">
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2A2A] rounded text-[10px]">{app.allotmentStatus}</span>
              </div>
              <div className="w-[12%] text-center text-kite-text-light">
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2A2A] rounded text-[10px]">{app.listingStatus}</span>
              </div>
              <div className="w-[17%] flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {app.listingStatus !== 'Exited' && (
                  <button 
                    onClick={() => {
                      const exitAmount = app.appliedAmount;
                      const commissionAmount = exitAmount * 0.01;
                      
                      const newApps = applications.map(a => a.id === app.id ? { ...a, listingStatus: 'Exited' } : a);
                      saveApplications(newApps as any);
                      
                      const newComm = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'Exit',
                        ipoId: ipo.id,
                        investorId: app.investorId,
                        amount: commissionAmount,
                        date: new Date().toISOString()
                      };
                      saveCommissions([...commissions, newComm] as any);
                      alert(\`Exited successfully! 1% commission (₹\${commissionAmount.toFixed(2)}) charged.\`);
                    }} 
                    className="bg-kite-red text-white px-3 py-1 rounded-sm text-[12px] hover:bg-red-600"
                  >
                    Exit / Sell
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  </div>
) : (
  <div className="flex-1 overflow-auto">
`;

// Now I will inject this right before `<div className="flex-1 overflow-auto">` that is for the main table
content = content.replace(/<div className="flex-1 overflow-auto">\s*<div className="min-w-\[1000px\]">/, myAppsUi + '    <div className="min-w-[1000px]">');

// Close the ternary that I just opened
content = content.replace(/(<\/div>\s*<\/div>\s*)}/g, '$1)}\n          </div>');
// Wait, regex might be tricky. Let me just use split and join.

const parts = content.split('<div className="flex-1 overflow-auto">');
if (parts.length > 2) {
  content = parts[0] + myAppsUi + '    <div className="min-w-[1000px]">' + parts[2];
  
  // Need to append the closing parenthesis for the ternary
  const endTable = '</div>\n          </div>\n        </div>\n      )}';
  content = content.replace('</div>\n          </div>\n        </div>\n      )}', '</div>\n          </div>\n          )}\n        </div>\n      )}');
}

fs.writeFileSync('src/pages/Bids.tsx', content);
console.log("Patched Bids apps tab");
