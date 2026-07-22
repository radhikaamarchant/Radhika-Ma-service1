const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// 1. In setOrderMode, force QTY for SELL
content = content.replace(
  'setOrderMode(orderMode === "BUY" ? "SELL" : "BUY");',
  `const newMode = orderMode === "BUY" ? "SELL" : "BUY";
  setOrderMode(newMode);
  if (newMode === "SELL") setInputMode("QTY");`
);

// 2. Hide toggle button in SELL mode (Desktop)
content = content.replace(
  /<button\s*type="button"\s*onClick=\{\(\) =>\s*handleInputModeChange\(\s*inputMode === "QTY" \? "AMOUNT" : "QTY",\s*\)\s*\}\s*className="absolute right-3 top-1\/2/g,
  `{orderMode === "BUY" && (<button
                            type="button"
                            onClick={() =>
                              handleInputModeChange(
                                inputMode === "QTY" ? "AMOUNT" : "QTY",
                              )
                            }
                            className="absolute right-3 top-1/2`
);
content = content.replace(
  /<\/span>\s*\}\)\s*<\/button>\s*<\/div>\s*<div className="text-\[11px\] text-gray-500/g,
  `</span>
                            )}
                          </button>)}
                        </div>
                        <div className="text-[11px] text-gray-500`
);

// 3. Hide toggle button in SELL mode (Mobile) - Need to find mobile toggle button
fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched input mode");
