const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const desktopCode = `
          {isMobile ? (
`;

const desktopCodeEnd = `
          ) : (
            <motion.div
              className="w-full max-w-[680px] bg-white dark:bg-[#111111] rounded-[4px] shadow-2xl flex flex-col font-sans overflow-hidden border border-gray-200/50 dark:border-[#2A2A2A]/50"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopShowInvestorSelect(false);
              }}
            >
              <div className={\`h-[70px] px-6 flex items-center justify-between transition-colors duration-300 \${orderMode === "BUY" ? "bg-[#4184F3]" : "bg-[#FF5722]"}\`}>
                <div className="flex flex-col text-white">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[16px] font-medium tracking-wide">
                      {selectedBusiness?.shortName?.toUpperCase() || selectedBusiness?.name?.toUpperCase() || "BUSINESS"}
                    </h2>
                    <span className="text-[13px] opacity-90">BSE {formatINR(currentMarketPrice)}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] opacity-80 mt-0.5">
                    <span>FND {formatShortINR(selectedBusiness?.fundingRequired || 0)}</span>
                    <span>INC {formatShortINR(
                      state.investments
                        .filter((inv) => inv.businessId === selectedBusiness?.id && inv.status === "active")
                        .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)
                    )}</span>
                  </div>
                </div>
                
                <div className="flex bg-black/20 rounded-[4px] p-0.5">
                  <button 
                    onClick={() => { setOrderMode("BUY"); setFormData({ ...formData, investorIds: [] }); }}
                    className={\`px-4 py-1.5 rounded-[3px] text-[12px] font-semibold transition-all \${orderMode === "BUY" ? "bg-white text-[#4184F3] shadow-sm" : "text-white/90 hover:text-white"}\`}
                  >
                    BUY
                  </button>
                  <button 
                    onClick={() => { setOrderMode("SELL"); setFormData({ ...formData, investorIds: [] }); }}
                    className={\`px-4 py-1.5 rounded-[3px] text-[12px] font-semibold transition-all \${orderMode === "SELL" ? "bg-white text-[#FF5722] shadow-sm" : "text-white/90 hover:text-white"}\`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-5 relative">
                    <div className="space-y-1.5">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDesktopShowInvestorSelect(!desktopShowInvestorSelect);
                          }}
                          className={\`w-full flex items-center justify-between bg-white dark:bg-[#1B1B1B] border rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] transition-colors \${desktopShowInvestorSelect ? (orderMode === 'BUY' ? 'border-[#4184F3]' : 'border-[#FF5722]') : "border-gray-200 dark:border-[#2A2A2A]"}\`}
                        >
                          <span className="truncate">
                            {selectedInvestors.length > 0
                              ? selectedInvestors.length === 1
                                ? selectedInvestors[0].name.toUpperCase()
                                : \`\${selectedInvestors.length} Investors Selected\`
                              : "Select Investor"}
                          </span>
                          <ChevronDown className={\`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 ml-2 transition-transform \${desktopShowInvestorSelect ? "rotate-180" : ""}\`} />
                        </button>
                        <AnimatePresence>
                          {desktopShowInvestorSelect && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0 flex flex-col gap-2">
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search by name or ID..."
                                    className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                    value={investorSearch}
                                    onChange={(e) => setInvestorSearch(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const filteredIds = sortedInvestors.filter((i) => {
                                        if (!i.name.toLowerCase().includes(investorSearch.toLowerCase()) && !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())) return false;
                                        if (!isMobile && orderMode === "SELL" && selectedBusiness) {
                                          const hasActive = state.investments.some((inv) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active");
                                          if (!hasActive) return false;
                                        }
                                        return true;
                                      }).map(i => i.id);

                                      if (filteredIds.every(id => formData.investorIds.includes(id)) && filteredIds.length > 0) {
                                        setFormData({ ...formData, investorIds: formData.investorIds.filter(id => !filteredIds.includes(id)) });
                                      } else {
                                        const newSet = new Set([...formData.investorIds, ...filteredIds]);
                                        setFormData({ ...formData, investorIds: Array.from(newSet) });
                                      }
                                    }}
                                    className="text-[12px] text-[#4184F3] hover:underline font-medium"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto">
                                {sortedInvestors
                                  .filter((i) => {
                                    if (!i.name.toLowerCase().includes(investorSearch.toLowerCase()) && !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())) return false;
                                    if (!isMobile && orderMode === "SELL" && selectedBusiness) {
                                      const hasActive = state.investments.some((inv) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active");
                                      if (!hasActive) return false;
                                    }
                                    return true;
                                  })
                                  .map((i) => {
                                    const activeCount = selectedBusiness ? state.investments.filter((inv) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;
                                    return (
                                      <button
                                        key={i.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFormData({ ...formData, investorIds: [i.id] });
                                          setDesktopShowInvestorSelect(false);
                                          setInvestorSearch("");
                                        }}
                                        className={\`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center justify-between \${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#E3E3E3]"}\`}
                                      >
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                          {i.photoUrl ? (
                                            <img src={i.photoUrl} alt={i.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                          ) : (
                                            <div className="w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#4184F3]/20 flex items-center justify-center text-[#4184F3] text-[10px] font-bold shrink-0">
                                              {i.name.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <span className="truncate">{i.name.toUpperCase()}</span>
                                          {activeCount > 0 && (
                                            <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px] shrink-0">
                                              {activeCount}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center shrink-0 ml-2">
                                          {formData.investorIds.includes(i.id) && (
                                            <CheckCircle className="w-4 h-4 text-[#4184F3]" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                {sortedInvestors.filter((i) => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())).length === 0 && (
                                  <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                    No investors found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex gap-4 mb-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={inputMode === "QTY"} 
                            onChange={() => handleInputModeChange("QTY")}
                            className={orderMode === 'BUY' ? 'accent-[#4184F3]' : 'accent-[#FF5722]'} 
                          />
                          <span className="text-[12px] text-gray-700 dark:text-[#C4C4C4]">Qty</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={inputMode === "AMOUNT"} 
                            onChange={() => handleInputModeChange("AMOUNT")}
                            className={orderMode === 'BUY' ? 'accent-[#4184F3]' : 'accent-[#FF5722]'} 
                          />
                          <span className="text-[12px] text-gray-700 dark:text-[#C4C4C4]">Amount</span>
                        </label>
                      </div>
                      <input 
                        type="text"
                        value={desktopInputValue}
                        onChange={handleDesktopInputChange}
                        className={\`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors \${orderMode === 'BUY' ? 'focus:border-[#4184F3]' : 'focus:border-[#FF5722]'}\`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="space-y-1.5 mt-[48px]">
                      <div className="flex gap-4 mb-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={priceType === "MARKET"} 
                            onChange={() => handlePriceTypeChange("MARKET")}
                            className={orderMode === 'BUY' ? 'accent-[#4184F3]' : 'accent-[#FF5722]'} 
                          />
                          <span className="text-[12px] text-gray-700 dark:text-[#C4C4C4]">Market</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={priceType === "LIMIT"} 
                            onChange={() => handlePriceTypeChange("LIMIT")}
                            className={orderMode === 'BUY' ? 'accent-[#4184F3]' : 'accent-[#FF5722]'} 
                          />
                          <span className="text-[12px] text-gray-700 dark:text-[#C4C4C4]">Limit</span>
                        </label>
                      </div>
                      <input 
                        type="number"
                        disabled={priceType === "MARKET"}
                        value={priceType === "MARKET" ? currentMarketPrice : manualPrice}
                        onChange={handleManualPriceChange}
                        className={\`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-[#111111] disabled:text-gray-500 \${orderMode === 'BUY' ? 'focus:border-[#4184F3]' : 'focus:border-[#FF5722]'}\`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-5 border-t border-gray-100 dark:border-[#2A2A2A]/30 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider">Duration</label>
                    <input
                      type="number"
                      value={formData.timePeriodMonths}
                      onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider">Expected ROI</label>
                    <input
                      type="number"
                      value={expectedRoi}
                      onChange={(e) => setExpectedRoi(e.target.value)}
                      disabled={orderMode === "SELL"}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider">Bus Brokerage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.adminCommissionBusinessPct}
                      onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                      disabled={orderMode === "SELL"}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 dark:text-[#8F8F8F] uppercase tracking-wider">Inv Brokerage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.adminCommissionInvestorPct}
                      onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                      disabled={orderMode === "SELL"}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-[#2A2A2A] pb-1 text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-gray-400 dark:focus:border-gray-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="h-[64px] bg-gray-50/50 dark:bg-[#141414] px-6 border-t border-gray-100 dark:border-[#2A2A2A]/50 flex items-center justify-between shrink-0">
                <div className="flex gap-8 text-[12px]">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-[#8F8F8F]">Required</span>
                    <span className="font-medium text-gray-900 dark:text-[#E3E3E3]">{formatINR(getRawAmount(formData.amount))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-[#8F8F8F]">Available</span>
                    <span className="font-medium text-gray-900 dark:text-[#E3E3E3]">₹0.00</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-[#8F8F8F]">Brokerage</span>
                    <span className="font-medium text-gray-900 dark:text-[#E3E3E3]">{formatINR(calculateCommissions().totalAdmin)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 rounded-[4px] border border-gray-200 dark:border-[#2A2A2A] text-[13px] font-medium text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddSubmit}
                    disabled={isBooking || !selectedBusiness || selectedInvestors.length === 0}
                    className={\`px-8 py-2 rounded-[4px] text-[13px] font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 \${orderMode === 'BUY' ? 'bg-[#4184F3] hover:bg-[#3367D6]' : 'bg-[#FF5722] hover:bg-[#E64A19]'}\`}
                  >
                    {isBooking ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Booking</>
                    ) : orderMode === "BUY" ? "BUY" : "SELL"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
`;

content = content.replace(
  /<motion\.div\s*\n\s*className="w-full h-full md:h-auto max-w-\[600px\]/,
  match => desktopCode + match
);

content = content.replace(
  /<\/motion\.div>\n\s*<\/motion\.div>\n\s*<\/AnimatePresence>/,
  match => `</motion.div>\n` + desktopCodeEnd + `\n        </motion.div>\n      )} \n    </AnimatePresence>`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
