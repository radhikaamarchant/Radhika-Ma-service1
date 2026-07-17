const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const newUI = `          <div className="border border-kite-border-soft rounded mt-4 overflow-hidden">
            <div className="p-3 border-b border-kite-border-soft flex justify-between items-center bg-gray-50 dark:bg-kite-bg/50">
               <span className="text-[12px] font-medium text-kite-text uppercase tracking-wide">Market Percentage Settings (Per Qty)</span>
            </div>
            <div className="p-4 bg-white dark:bg-kite-surface flex flex-col gap-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1 block">Increase Market (%)</label>
                   <input
                     type="number"
                     step="0.01"
                     value={triggerConfig.increaseMarket}
                     onChange={(e) => setTriggerConfig({ ...triggerConfig, increaseMarket: e.target.value })}
                     className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] font-mono text-kite-text focus:border-kite-blue transition-colors"
                     placeholder="e.g. 0.1"
                   />
                 </div>
                 <div>
                   <label className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1 block">Down Market (%)</label>
                   <input
                     type="number"
                     step="0.01"
                     value={triggerConfig.downMarket}
                     onChange={(e) => setTriggerConfig({ ...triggerConfig, downMarket: e.target.value })}
                     className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] font-mono text-kite-text focus:border-kite-blue transition-colors"
                     placeholder="e.g. 0.05"
                   />
                 </div>
               </div>
               <button
                onClick={() => {
                  dispatch({
                    type: "UPDATE_BUSINESS",
                    payload: {
                      ...business,
                      increaseMarket: parseFloat(triggerConfig.increaseMarket) || undefined,
                      downMarket: parseFloat(triggerConfig.downMarket) || undefined,
                    }
                  });
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                }}
                className="w-full bg-kite-blue text-white px-5 py-2.5 rounded text-[13px] font-medium hover:bg-kite-blue-dark transition-colors uppercase tracking-wide mt-2"
              >
                {showSuccess ? "Saved Successfully" : "Save Market Settings"}
              </button>
            </div>
          </div>`;

code = code.replace(
  /<div className="border border-kite-border-soft rounded mt-4 overflow-hidden">[\s\S]*?APPLY\s*<\/button>\s*<\/div>\s*<\/div>/g,
  newUI
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
