const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const target = `<div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>`;
const replacement = `<div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>
                <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>
                <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted pl-5 border-l border-kite-vertical-divider">FUND</div>
              </div>
            </div>
            
            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">
              <div className="md:overflow-visible overflow-hidden">
                {" "}
                {/* Unified Watchlist View */}{" "}
                <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">`;

const exactTargetToRemove = `<div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>                    <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted pl-5 border-l border-kite-vertical-divider">FUND</div>                  </div>`;

// Wait, the new content doesn't have the list wrappers, but it still has the old ID, ROI, FUND.
// I will just replace the old string.
