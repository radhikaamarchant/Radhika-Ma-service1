const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

code = code.replaceAll(
  'rounded-full flex items-center justify-center shrink-0">\n      {orderMode === "SELL"',
  'rounded-[4px] flex items-center justify-center shrink-0">\n      {orderMode === "SELL"'
);

const desktopMapStr = `className={\`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors flex items-center justify-between \${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#FFFFFF]"}\`}`;
const desktopMapReplacement = `className={\`w-full text-left px-[15px] py-[10px] border-b border-gray-200 dark:border-[#333333] last:border-0 text-[13px] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors flex items-center justify-between \${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#FFFFFF]"}\`}`;
code = code.replace(desktopMapStr, desktopMapReplacement);

const sourceBlock = `                                            <span className="truncate">
                                              <span className="capitalize">{i.name.toLowerCase()}</span>
                                            </span>
                                            {activeCount > 0 && (
    <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex items-center justify-center shrink-0">
      {orderMode === "SELL" ? \`\${totalQty} Qty\` : activeCount}
    </div>
  )}
                                          </div>
                                          <div className="flex items-center shrink-0 ml-2">`;
const destBlock = `                                            <span className="truncate">
                                              <span className="capitalize">{i.name.toLowerCase()}</span>
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {activeCount > 0 && (
                                              <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex items-center justify-center shrink-0">
                                                {orderMode === "SELL" ? \`\${totalQty} Qty\` : activeCount}
                                              </div>
                                            )}`;
code = code.replace(sourceBlock, destBlock);

const dropdownBgFind = `className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"`;
const dropdownBgReplace = `className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"`;
code = code.replaceAll(dropdownBgFind, dropdownBgReplace);

code = code.replaceAll('bg-gray-50 dark:bg-[#111111]', 'bg-gray-50 dark:bg-transparent');

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
