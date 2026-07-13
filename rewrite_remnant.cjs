const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const remnant = `              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">                <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>                <div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>                    <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted pl-5 border-l border-kite-vertical-divider">FUND</div>                  </div>`;

const properlyFormatted = `              {/* DESKTOP HEADER */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
                <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>
                <div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>
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

if (content.includes(remnant.substring(0, 100))) {
    // try index of since exact spacing might be a bit off
    const startIndex = content.indexOf('<div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">');
    const endIndex = content.indexOf('FUND</div>                  </div>') + 'FUND</div>                  </div>'.length;
    
    if (startIndex !== -1 && endIndex !== -1) {
        const toReplace = content.substring(startIndex, endIndex);
        content = content.replace(toReplace, properlyFormatted);
        fs.writeFileSync('src/pages/Businesses.tsx', content);
        console.log("Success replacing remnant!");
    }
}
