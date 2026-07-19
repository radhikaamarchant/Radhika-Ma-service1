const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// The Footer
const oldFooter = /<div className="flex gap-8 text-\[12px\]">\s*<div className="flex flex-col">.*?<\/div>\s*<div className="flex flex-col">.*?<\/div>\s*<div className="flex flex-col">.*?<\/div>\s*<\/div>/s;
const newFooter = `<div className="flex items-center gap-1 text-[13px] text-gray-700 dark:text-[#C4C4C4]">
                  <span>Required</span>
                  <span className="font-medium text-[#4184F3]">
                    ₹{getRawAmount(formData.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {calculateCommissions().totalAdmin.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
