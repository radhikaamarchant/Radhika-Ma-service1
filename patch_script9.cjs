const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `{cityBusinessStats.length > 0 ? cityBusinessStats.map((b: any) => (
                  <div key={b.id} className="flex flex-col">
                    <div 
                      className="p-4 flex justify-between items-center hover:bg-kite-bg/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedBusinessId(b.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>
                        <span className="text-xs text-kite-text/60 mt-0.5">{b.ownerName}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-[15px] text-kite-text">{formatINR(b.totalInvested)}</span>
                        <span className="text-[12px] text-kite-text-light">Total Invested from <span className="capitalize">{selectedCity}</span></span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-kite-text-light text-[14px]">No businesses found for this city.</div>
                )}`;

const replacement = `{cityBusinessStats.length > 0 ? cityBusinessStats.map((b: any) => {
                  const uniqueInvestorCount = new Set(b.bizInvs.map((inv: any) => inv.investorId)).size;
                  return (
                  <div 
                    key={b.id} 
                    className="p-4 flex justify-between items-center hover:bg-kite-bg/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedBusinessId(b.id)}
                  >
                    <span className="font-medium text-kite-text text-[14px]">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</span>
                    <span className="font-medium text-[14px] text-kite-text">{uniqueInvestorCount} Investors</span>
                  </div>
                )}) : (
                  <div className="p-8 text-center text-kite-text-light text-[14px]">No businesses found for this city.</div>
                )}`;

if (code.includes(targetStr)) {
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(targetStr, replacement));
    console.log("Patched list items");
} else {
    console.log("Could not find target string");
}
