const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// 1. Header Fix: Revert to colored background and white text.
// old: <div className="h-[70px] px-6 flex items-center justify-between transition-colors duration-300 bg-white dark:bg-[#1B1B1B] border-b border-gray-100 dark:border-[#2A2A2A]/50">
const oldHeaderOuter = /<div className="h-\[70px\] px-6 flex items-center justify-between transition-colors duration-300 bg-white dark:bg-\[#1B1B1B\] border-b border-gray-100 dark:border-\[#2A2A2A\]\/50">/;
const newHeaderOuter = `<div className={\`h-[70px] px-6 flex items-center justify-between transition-colors duration-300 \${orderMode === "BUY" ? "bg-[#4184F3]" : "bg-[#FF5722]"}\`}>`;
content = content.replace(oldHeaderOuter, newHeaderOuter);

const oldHeaderText = /<div className="flex flex-col text-gray-900 dark:text-\[#E3E3E3\]">/;
const newHeaderText = `<div className="flex flex-col text-white">`;
content = content.replace(oldHeaderText, newHeaderText);

// 2. Buy/Sell Toggle Fix: Single switch like Zerodha
const oldToggle = /<div \s*className="flex bg-gray-100 dark:bg-\[#111111\] border border-gray-200 dark:border-\[#2A2A2A\] rounded-\[4px\] p-0\.5 relative items-center cursor-pointer w-\[120px\] h-\[32px\]".*?<\/div>/s;
const newToggle = `<div 
                  className="relative inline-flex h-4 w-[34px] shrink-0 items-center rounded-full cursor-pointer transition-colors border border-white/20 hover:border-white/40 bg-black/10"
                  style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
                  onClick={() => { 
                    setOrderMode(orderMode === "BUY" ? "SELL" : "BUY"); 
                    setFormData({ ...formData, investorIds: [] }); 
                  }}
                >
                  <span className={\`inline-block h-[14px] w-[14px] transform rounded-full bg-white transition-transform duration-300 shadow-sm \${orderMode === "BUY" ? "translate-x-[2px]" : "translate-x-[16px]"}\`} />
                </div>`;
content = content.replace(oldToggle, newToggle);

// 3. CAP tab fields:
// Actually, they requested: "CAP Tab - Move only these fields: Duration, Expected ROI, Business Brokerage (%), Investor Brokerage (%). Nothing else."
// Currently they are already in the CAP tab block!
// See line 1085: } else { <div className="grid grid-cols-2 gap-6"> ... Duration, Expected ROI, Business Brokerage, Investor Brokerage ... </div> }
// So CAP tab is already correct.

// 4. Qty / Amount Input Fix: 
const oldQtyAmountInput = /<div className="space-y-1\.5">\s*<label className="text-\[12px\] text-gray-700 dark:text-\[#C4C4C4\] block mb-1">\s*\{inputMode === "QTY" \? "Qty" : "Amount"\}\s*<\/label>\s*<div className="relative">.*?<\/div>\s*<\/div>/s;
const newQtyAmountInput = `<div className="space-y-1.5">
                        <label className="text-[12px] text-gray-700 dark:text-[#C4C4C4] block mb-1">
                          {inputMode === "QTY" ? "Qty." : "Amount"}
                        </label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={desktopInputValue}
                            onChange={handleDesktopInputChange}
                            className={\`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] pl-3 pr-10 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors \${orderMode === 'BUY' ? 'focus:border-[#4184F3]' : 'focus:border-[#FF5722]'}\`}
                          />
                          <button
                            type="button"
                            onClick={() => handleInputModeChange(inputMode === "QTY" ? "AMOUNT" : "QTY")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center w-6 h-6"
                          >
                            {inputMode === "QTY" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
                            ) : (
                              <span className="font-semibold text-[14px]">₹</span>
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8F8F8F] mt-1">
                          {inputMode === 'AMOUNT' ? \`\${formData.quantity || 0} qty.\` : \`₹\${formData.amount || 0}\`}
                        </div>
                      </div>`;
content = content.replace(oldQtyAmountInput, newQtyAmountInput);

// 5. Bottom Buttons Fix:
// Left: BUY/SELL, Right: Cancel
const oldButtons = /<button \s*onClick=\{handleAddSubmit\}.*?<\/button>\s*<button \s*onClick=\{onClose\}.*?<\/button>/s;
const newButtons = `<button 
                    onClick={handleAddSubmit}
                    disabled={isBooking || !selectedBusiness || selectedInvestors.length === 0}
                    className={\`px-8 py-2 rounded-[4px] text-[13px] font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 \${orderMode === 'BUY' ? 'bg-[#4184F3] hover:bg-[#3367D6]' : 'bg-[#FF5722] hover:bg-[#E64A19]'}\`}
                  >
                    {isBooking ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Booking</>
                    ) : orderMode === "BUY" ? "Buy" : "Sell"}
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 rounded-[4px] border border-gray-200 dark:border-[#2A2A2A] text-[13px] font-medium text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    Cancel
                  </button>`;
content = content.replace(oldButtons, newButtons);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
