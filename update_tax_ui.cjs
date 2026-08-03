const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetStr = `                <div className="space-y-4">
                  <h3 className="text-[15px] font-medium text-kite-text">Duration Type</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="durationType" value="hours" checked={taxPayerConfig.durationType === "hours"} onChange={() => setTaxPayerConfig({...taxPayerConfig, durationType: "hours"})} className="text-kite-blue focus:ring-kite-blue" />
                      <span className="text-[14px] text-kite-text">Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="durationType" value="days" checked={taxPayerConfig.durationType === "days"} onChange={() => setTaxPayerConfig({...taxPayerConfig, durationType: "days"})} className="text-kite-blue focus:ring-kite-blue" />
                      <span className="text-[14px] text-kite-text">Days</span>
                    </label>
                  </div>
                </div>

                {taxPayerConfig.durationType === "hours" ? (
                  <div className="space-y-4 border border-kite-border p-4 rounded bg-gray-50 dark:bg-kite-bg">
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Hours Threshold</label>
                      <input type="number" min="1" value={taxPayerConfig.hoursThreshold} onChange={(e) => setTaxPayerConfig({...taxPayerConfig, hoursThreshold: Number(e.target.value)})} className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Charge Amount (₹)</label>
                      <input type="text" value={taxPayerConfig.hourlyAmount ? Number(String(taxPayerConfig.hourlyAmount).replace(/,/g, '')).toLocaleString('en-IN') : ''} onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(val)) && val.trim() !== '') {
                            setTaxPayerConfig({...taxPayerConfig, hourlyAmount: Number(val)});
                          } else if (val === '') {
                            setTaxPayerConfig({...taxPayerConfig, hourlyAmount: 0});
                          }
                      }} placeholder="e.g. 500" className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border border-kite-border p-4 rounded bg-gray-50 dark:bg-kite-bg">
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Days Threshold</label>
                      <input type="number" min="1" value={taxPayerConfig.daysThreshold} onChange={(e) => setTaxPayerConfig({...taxPayerConfig, daysThreshold: Number(e.target.value)})} className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Charge Amount (₹)</label>
                      <input type="text" value={taxPayerConfig.dailyAmount ? Number(String(taxPayerConfig.dailyAmount).replace(/,/g, '')).toLocaleString('en-IN') : ''} onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(val)) && val.trim() !== '') {
                            setTaxPayerConfig({...taxPayerConfig, dailyAmount: Number(val)});
                          } else if (val === '') {
                            setTaxPayerConfig({...taxPayerConfig, dailyAmount: 0});
                          }
                      }} placeholder="e.g. 1000" className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <button onClick={handleSaveTaxPayer} className="w-full bg-kite-blue text-white py-3 rounded font-normal text-[14px] md:text-[15px] hover:opacity-90 active:scale-[0.98] transition-all">
                  Save Tax Payer Settings
                </button>
              </div>`;

const newStr = `                <div className="space-y-4">
                  <h3 className="text-[15px] font-medium text-kite-text">Duration Type</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="durationType" value="minutes" checked={taxPayerConfig.durationType === "minutes"} onChange={() => setTaxPayerConfig({...taxPayerConfig, durationType: "minutes"})} className="text-kite-blue focus:ring-kite-blue" />
                      <span className="text-[14px] text-kite-text">Minutes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="durationType" value="hours" checked={taxPayerConfig.durationType === "hours"} onChange={() => setTaxPayerConfig({...taxPayerConfig, durationType: "hours"})} className="text-kite-blue focus:ring-kite-blue" />
                      <span className="text-[14px] text-kite-text">Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="durationType" value="days" checked={taxPayerConfig.durationType === "days"} onChange={() => setTaxPayerConfig({...taxPayerConfig, durationType: "days"})} className="text-kite-blue focus:ring-kite-blue" />
                      <span className="text-[14px] text-kite-text">Days</span>
                    </label>
                  </div>
                </div>

                {taxPayerConfig.durationType === "minutes" && (
                  <div className="space-y-4 border border-kite-border p-4 rounded bg-gray-50 dark:bg-kite-bg">
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Minutes Threshold (1-30)</label>
                      <input type="number" min="1" max="30" value={taxPayerConfig.minutesThreshold} onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 30) val = 30;
                        if (val < 1) val = 1;
                        setTaxPayerConfig({...taxPayerConfig, minutesThreshold: val})
                      }} className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Charge Amount (₹)</label>
                      <input type="text" value={taxPayerConfig.minuteAmount ? Number(String(taxPayerConfig.minuteAmount).replace(/,/g, '')).toLocaleString('en-IN') : ''} onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(val)) && val.trim() !== '') {
                            setTaxPayerConfig({...taxPayerConfig, minuteAmount: Number(val)});
                          } else if (val === '') {
                            setTaxPayerConfig({...taxPayerConfig, minuteAmount: 0});
                          }
                      }} placeholder="e.g. 50" className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                  </div>
                )}

                {taxPayerConfig.durationType === "hours" && (
                  <div className="space-y-4 border border-kite-border p-4 rounded bg-gray-50 dark:bg-kite-bg">
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Hours Threshold</label>
                      <input type="number" min="1" value={taxPayerConfig.hoursThreshold} onChange={(e) => setTaxPayerConfig({...taxPayerConfig, hoursThreshold: Number(e.target.value)})} className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Charge Amount (₹)</label>
                      <input type="text" value={taxPayerConfig.hourlyAmount ? Number(String(taxPayerConfig.hourlyAmount).replace(/,/g, '')).toLocaleString('en-IN') : ''} onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(val)) && val.trim() !== '') {
                            setTaxPayerConfig({...taxPayerConfig, hourlyAmount: Number(val)});
                          } else if (val === '') {
                            setTaxPayerConfig({...taxPayerConfig, hourlyAmount: 0});
                          }
                      }} placeholder="e.g. 500" className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                  </div>
                )}
                
                {taxPayerConfig.durationType === "days" && (
                  <div className="space-y-4 border border-kite-border p-4 rounded bg-gray-50 dark:bg-kite-bg">
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Days Threshold</label>
                      <input type="number" min="1" value={taxPayerConfig.daysThreshold} onChange={(e) => setTaxPayerConfig({...taxPayerConfig, daysThreshold: Number(e.target.value)})} className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1 text-kite-text-light">Charge Amount (₹)</label>
                      <input type="text" value={taxPayerConfig.dailyAmount ? Number(String(taxPayerConfig.dailyAmount).replace(/,/g, '')).toLocaleString('en-IN') : ''} onChange={(e) => {
                          const val = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(val)) && val.trim() !== '') {
                            setTaxPayerConfig({...taxPayerConfig, dailyAmount: Number(val)});
                          } else if (val === '') {
                            setTaxPayerConfig({...taxPayerConfig, dailyAmount: 0});
                          }
                      }} placeholder="e.g. 1000" className="w-full border border-kite-border rounded px-3 py-2 bg-white dark:bg-kite-surface text-[14px] text-kite-text outline-none focus:border-kite-blue" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={handleSaveTaxPayer} 
                  disabled={isSavingTax}
                  className="w-full bg-kite-blue text-white py-3 rounded font-normal text-[14px] md:text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingTax ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save setting"
                  )}
                </button>
              </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/AdminPage.tsx', code);
  console.log("Updated AdminPage tax UI");
} else {
  console.error("Target string not found in AdminPage.tsx.");
}
