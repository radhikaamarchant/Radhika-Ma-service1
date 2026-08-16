const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const target = '      {currentView === "registration" && (';
const injection = `      {currentView === "hpgSahay" && (
        <div className="bg-[#F8F9FA] dark:bg-kite-bg flex-1 flex flex-col p-4 md:p-6 space-y-6">
          <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4">
            <h2 className="text-[16px] font-medium text-kite-text mb-4 border-b border-kite-border pb-2">Business Subsidy Setup</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-kite-text font-medium">Enable Subsidy</span>
                <button
                  onClick={() => setHpgSahayData(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={\`w-10 h-5 rounded-full relative transition-colors \${hpgSahayData.enabled ? "bg-kite-blue" : "bg-gray-300 dark:bg-gray-600"}\`}
                >
                  <div className={\`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all \${hpgSahayData.enabled ? "left-[22px]" : "left-0.5"}\`} />
                </button>
              </div>
              <div>
                <label className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1 block">Subsidy Percentage (%)</label>
                <input
                  type="number"
                  value={hpgSahayData.percentage}
                  onChange={(e) => setHpgSahayData({ ...hpgSahayData, percentage: e.target.value })}
                  className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] text-kite-text focus:border-kite-blue transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1 block">Minimum Investors Target</label>
                <input
                  type="number"
                  value={hpgSahayData.minInvestors}
                  onChange={(e) => setHpgSahayData({ ...hpgSahayData, minInvestors: e.target.value })}
                  className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] text-kite-text focus:border-kite-blue transition-colors"
                />
              </div>
              <button
                onClick={handleSaveHpgSahay}
                className="w-full bg-kite-blue !text-white dark:text-white px-5 py-2.5 rounded text-[13px] font-medium hover:bg-kite-blue-dark transition-colors uppercase tracking-wide"
              >
                {isSavingSahay ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : showSuccess ? "verifed value" : "confrim limit"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Investors</p>
              <p className="text-[20px] font-normal text-kite-blue">{hpgStats.investors}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Profit</p>
              <p className="text-[20px] font-normal text-[#4CAF50]">{formatINR(hpgStats.totalProfit)}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Loss</p>
              <p className="text-[20px] font-normal text-[#DF514C]">{formatINR(hpgStats.totalLoss)}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">High Profit</p>
              <p className="text-[20px] font-normal text-kite-blue">{formatINR(hpgStats.highProfit)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border flex-1 flex flex-col overflow-hidden">
            <h2 className="text-[15px] font-medium text-kite-text p-4 border-b border-kite-border">{business.name} Deta list</h2>
            <div className="overflow-auto p-4 space-y-3">
              {hpgStats.details.length === 0 ? (
                <div className="text-center text-kite-text-light text-[13px] py-10">No detailed statements available.</div>
              ) : (
                hpgStats.details.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-kite-border-soft pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[14px] font-medium text-kite-text">{item.investorName}</p>
                      <p className="text-[12px] text-kite-text-light">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={\`text-[14px] font-medium \${item.netProfit >= 0 ? "text-[#4CAF50]" : "text-[#DF514C]"}\`}>
                        {item.netProfit >= 0 ? "+" : ""}{formatINR(item.netProfit)}
                      </p>
                      <p className="text-[12px] text-kite-text-light">Net P&L</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === "registration" && (`;

code = code.replace(target, injection);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
