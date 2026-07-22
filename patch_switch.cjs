const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const sourceSwitch = `<div
                  className="relative inline-flex h-4 w-[34px] shrink-0 items-center rounded-full cursor-pointer transition-colors border border-white/20 hover:border-white/40 bg-black/10"
                  style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                  onClick={() => {`;

const destSwitch = `<div
                  className={\`relative inline-flex h-4 w-[34px] shrink-0 items-center rounded-full cursor-pointer transition-colors border border-white/20 hover:border-white/40 bg-black/10 \${orderMode === "BUY" ? "dark:!bg-[#4987EE]" : "dark:!bg-[#D4603B]"}\`}
                  onClick={() => {`;

code = code.replace(sourceSwitch, destSwitch);

// Now action button
const sourceButton = `className={\`w-[75px] h-[36.8px] p-[10px_20px] rounded-[4px] text-[14px] font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 \${orderMode === "BUY" ? "bg-[#4184F3] dark:bg-[#387ed1] hover:bg-[#3367D6]" : "bg-[#FF5722] dark:bg-[#D4603B] hover:bg-[#E64A19]"}\`}`;
const destButton = `className={\`w-[75px] h-[36.8px] p-[10px_20px] rounded-[4px] text-[14px] font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 \${orderMode === "BUY" ? "bg-[#4184F3] dark:bg-[#4987EE] hover:bg-[#3367D6]" : "bg-[#FF5722] dark:bg-[#D4603B] hover:bg-[#E64A19]"}\`}`;
code = code.replace(sourceButton, destButton);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
