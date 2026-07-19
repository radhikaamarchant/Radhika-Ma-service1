const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldHeader = /<div className="flex flex-col text-white">\s*<div className="flex items-center gap-3">\s*<h2 className="text-\[16px\] font-bold tracking-wide">\s*\{selectedBusiness\?\.shortName\?\.toUpperCase\(\) \|\|\s*selectedBusiness\?\.name\?\.toUpperCase\(\) \|\|\s*"BUSINESS"\}\s*<\/h2>\s*<span className="text-\[13px\] opacity-90">\s*BSE \{formatINR\(currentMarketPrice\)\}\s*<\/span>\s*<\/div>\s*<div className="flex gap-4 text-\[11px\] opacity-80 mt-0\.5">\s*<span>\s*FND\{" "\}\s*\{formatShortINR\(selectedBusiness\?\.fundingRequired \|\| 0\)\}\s*<\/span>/s;

const newHeader = `<div className="flex flex-col text-white">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[16px] font-bold tracking-wide text-white">
                      {selectedBusiness?.shortName?.toUpperCase() ||
                        selectedBusiness?.name?.toUpperCase() ||
                        "BUSINESS"}
                    </h2>
                  </div>
                  <div className="flex gap-4 text-[11px] opacity-80 mt-0.5 text-white">
                    <span>
                      BSE {formatINR(currentMarketPrice)}
                    </span>
                    <span>
                      FND{" "}
                      {formatShortINR(selectedBusiness?.fundingRequired || 0)}
                    </span>`;

if (oldHeader.test(content)) {
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
  console.log("Patched successfully");
} else {
  console.log("Not found");
}
