const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Hide toggle button in SELL mode (Mobile)
content = content.replace(
  /<button\s*type="button"\s*onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*setInputMode\(\s*inputMode === "AMOUNT" \? "QTY" : "AMOUNT",\s*\);\s*\}\}\s*className="p-1 hover:bg-gray-100 dark:hover:bg-\[#2A2A2A\] rounded text-\[#4184F3\]"\s*>\s*<ArrowUpDown className="w-4 h-4" \/>\s*<\/button>/g,
  `{orderMode === "BUY" && (<button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setInputMode(
                                inputMode === "AMOUNT" ? "QTY" : "AMOUNT",
                              );
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded text-[#4184F3]"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>)}`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched mobile input mode");
