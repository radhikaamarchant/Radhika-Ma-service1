const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetStr = `{showAddForm && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[110] bg-white dark:bg-kite-bg flex flex-col font-sans"
          >`;

const targetEndStr = `                )}
              </button>
            </div>
          </motion.div>
        )}`;

const newBlock = `{showAddForm && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[110] bg-[#1a1f26] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center px-4 h-[72px] shrink-0">
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white p-2 -ml-2"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="ml-3">
                <h2 className="text-[18px] font-medium text-white tracking-wide">
                  Book Investment
                </h2>
                <p className="text-[13px] text-gray-400">
                  Create a new investment
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-[160px] space-y-6 pt-2">
                {/* Business */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Select Business
                  </label>
                  <div className="relative">
                    <select
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white appearance-none outline-none focus:border-kite-blue"
                      value={formData.businessId}
                      onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                    >
                      <option value="" disabled className="bg-[#1a1f26]">Select Business</option>
                      {state.businesses.map((b, idx) => (
                        <option key={\`mob_biz_\${b.id}_\${idx}\`} value={b.id} className="bg-[#1a1f26]">
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Investor */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Investor
                  </label>
                  <div className="relative">
                    <select
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white appearance-none outline-none focus:border-kite-blue"
                      value={formData.investorId}
                      onChange={(e) => setFormData({ ...formData, investorId: e.target.value })}
                    >
                      <option value="" disabled className="bg-[#1a1f26]">Select Investor</option>
                      {state.investors.map((i, idx) => (
                        <option key={\`mob_inv_\${i.id}_\${idx}\`} value={i.id} className="bg-[#1a1f26]">
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Investment Amount
                  </label>
                  <div className="relative flex items-center border-b border-gray-700">
                    <span className="text-[16px] text-white absolute left-0">₹</span>
                    <input
                      type="text"
                      className="w-full py-2 pl-4 bg-transparent text-[16px] text-white outline-none focus:border-kite-blue"
                      placeholder="0"
                      value={formData.amount}
                      onChange={handleAmountChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white outline-none focus:border-kite-blue"
                      placeholder="12"
                      value={formData.timePeriodMonths}
                      onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Expected ROI (%)
                    </label>
                    <input
                      type="number"
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white outline-none focus:border-kite-blue"
                      placeholder="10.5"
                      value={expectedRoi}
                      onChange={(e) => setExpectedRoi(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Payout Frequency
                  </label>
                  <div className="flex border border-gray-700 rounded-md overflow-hidden bg-[#1e2329]">
                    <button
                      className={\`flex-1 py-2 text-[13px] transition-colors \${payoutFreq === "Monthly" ? "bg-[#4A8DF7] text-white" : "text-gray-300"}\`}
                      onClick={(e) => { e.preventDefault(); setPayoutFreq("Monthly"); }}
                    >
                      Monthly
                    </button>
                    <button
                      className={\`flex-1 py-2 text-[13px] border-l border-gray-700 transition-colors \${payoutFreq === "Yearly" ? "bg-[#4A8DF7] text-white" : "text-gray-300"}\`}
                      onClick={(e) => { e.preventDefault(); setPayoutFreq("Yearly"); }}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Investor NTSC (%)
                    </label>
                    <input
                      type="number"
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white outline-none focus:border-kite-blue"
                      placeholder="2"
                      value={formData.adminCommissionInvestorPct}
                      onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Business NTSC (%)
                    </label>
                    <input
                      type="number"
                      className="w-full py-2 bg-transparent border-b border-gray-700 text-[15px] text-white outline-none focus:border-kite-blue"
                      placeholder="2"
                      value={formData.adminCommissionBusinessPct}
                      onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                    />
                  </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1f26] px-4 py-4 pb-6 border-t border-gray-800">
              <div className="border border-gray-700 rounded bg-[#1e2329] p-3 mb-3 flex justify-between items-center">
                 <span className="text-gray-400 text-[13px]">Investment Amount</span>
                 <span className="text-white text-[15px]">₹{formData.amount || "0"}</span>
              </div>
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-gray-400 text-[11px] uppercase tracking-wider">Invest <span className="text-[#4A8DF7] ml-1">₹{formData.amount || "0"}</span></span>
                <span className="text-gray-400 text-[11px] uppercase tracking-wider">RMAS Brokerage <span className="text-white ml-1">₹0</span></span>
              </div>
              <SwipeButton
                actionType="BUY"
                text="SWIPE TO BUY"
                onSuccess={() => {
                   if (!selectedBusiness || !selectedInvestor) {
                     alert("Please select both a business and an investor.");
                     return;
                   }
                   handleAddSubmit({ preventDefault: () => {} } as any);
                }}
              />
            </div>
          </motion.div>
        )}`;

const startIdx = content.indexOf(targetStr);
const endIdx = content.indexOf(targetEndStr) + targetEndStr.length;

if (startIdx !== -1 && content.indexOf(targetEndStr) !== -1) {
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end bounds.");
  console.log("Start idx: ", startIdx);
  console.log("End idx: ", content.indexOf(targetEndStr));
}
