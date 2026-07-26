const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const regex = /                          <\/div>\s*<\/>\s*\)\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{withdrawTab === "positions" && \(/m;
const match = content.match(regex);
if (!match) {
  console.log("Regex not found!");
} else {
  const newSticky = `                          </div>
                          {/* Sticky Bottom Bar for Mobile - Today's P&L */}
                          <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-[#131415] border-t border-kite-border-soft shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 px-4 py-3 flex justify-between items-center md:hidden">
                            <span className="text-[14px] text-kite-text font-medium">
                              Today's P&L
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={\`text-[16px] font-medium \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                {activeTotalDayPnL >= 0 ? "+" : ""}{formatINR(Math.abs(activeTotalDayPnL)).replace("₹", "")}
                              </span>
                              <span className={\`text-[12px] \${activeTotalDayPnL >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}\`}>
                                {activeTotalDayChangePct >= 0 ? "+" : ""}{activeTotalDayChangePct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {withdrawTab === "positions" && (`;
  
  content = content.replace(regex, newSticky);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Sticky bar added!");
}
