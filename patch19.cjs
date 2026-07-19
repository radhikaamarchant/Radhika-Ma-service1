const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldHeader = `<h2 className="text-[16px] font-bold tracking-wide text-white">
                      {selectedBusiness?.shortName?.toUpperCase() ||
                        selectedBusiness?.name?.toUpperCase() ||
                        "BUSINESS"}
                    </h2>`;
const newHeader = `<div className="text-[16px] font-bold tracking-wide text-white !text-white">
                      {selectedBusiness?.shortName?.toUpperCase() ||
                        selectedBusiness?.name?.toUpperCase() ||
                        "BUSINESS"}
                    </div>`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
  console.log("Patched h2 to div");
} else {
  console.log("Not found");
}
