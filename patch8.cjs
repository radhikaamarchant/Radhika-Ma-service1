const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldToggle = /<div\s*className="flex bg-black\/20 rounded-\[4px\] p-0\.5 relative items-center cursor-pointer w-\[120px\] h-\[32px\]".*?<\/div>/s;

const newToggle = `<div 
                  className="flex bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] p-0.5 relative items-center cursor-pointer w-[120px] h-[32px]" 
                  onClick={() => { 
                    setOrderMode(orderMode === "BUY" ? "SELL" : "BUY"); 
                    setFormData({ ...formData, investorIds: [] }); 
                  }}
                >
                  <div className={\`absolute top-0.5 bottom-0.5 w-[58px] rounded-[3px] transition-transform duration-300 shadow-sm \${orderMode === "BUY" ? "translate-x-0 bg-[#4184F3]" : "translate-x-[56px] bg-[#FF5722]"}\`} />
                  <span className={\`w-1/2 text-center text-[12px] font-semibold z-10 transition-colors \${orderMode === "BUY" ? "text-white" : "text-gray-500 dark:text-gray-400"}\`}>BUY</span>
                  <span className={\`w-1/2 text-center text-[12px] font-semibold z-10 transition-colors \${orderMode === "SELL" ? "text-white" : "text-gray-500 dark:text-gray-400"}\`}>SELL</span>
                </div>`;

content = content.replace(oldToggle, newToggle);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
