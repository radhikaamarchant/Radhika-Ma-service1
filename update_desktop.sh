#!/bin/bash
sed -i '1154 s/w-full max-w-\[680px\]/w-[600px]/' src/components/AddInvestmentModal.tsx
sed -i '1160 s/h-\[70px\] px-6/h-[75px] px-6/' src/components/AddInvestmentModal.tsx
sed -i '1164 s/text-\[16px\]/text-[14px]/' src/components/AddInvestmentModal.tsx
sed -i '1170 s/text-\[11px\]/text-[12px]/' src/components/AddInvestmentModal.tsx
sed -i '1191 s/h-4 w-\[34px\]/h-[16px] w-[32px]/' src/components/AddInvestmentModal.tsx

sed -i '1213 s/className="bg-gray-50\/80/className="bg-gray-50\/80 w-[600px] h-[34.2px]/' src/components/AddInvestmentModal.tsx
sed -i '1216 s/text-\[13px\] font-medium py-3 border-b-2/text-[12px] font-medium h-[34.2px] flex items-center border-b-2/' src/components/AddInvestmentModal.tsx
sed -i '1222 s/text-\[13px\] font-medium py-3 border-b-2/text-[12px] font-medium h-[34.2px] flex items-center border-b-2/' src/components/AddInvestmentModal.tsx

# Inputs
sed -i '1478 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1478 s/pl-3 pr-10 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1562 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1562 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1585 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1585 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1596 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1596 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1631 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1631 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1657 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1657 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

# Footer
sed -i '1661 s/h-\[64px\] .* px-6/w-[600px] h-[61.8px] bg-gray-50\/50 dark:bg-[#141414] p-[12px_16px]/' src/components/AddInvestmentModal.tsx
sed -i '1663 s/<span>{orderMode === "SELL" ? "Cap" : "Required"}<\/span>/<span className="inline-block w-[50.86px] h-[19.2px] text-[12px] flex items-center">{orderMode === "SELL" ? "Cap" : "Required"}<\/span>/' src/components/AddInvestmentModal.tsx
sed -i '1664 s/className="font-medium text-\[#4184F3\]"/className="font-medium text-[#4184F3] text-[12px]"/' src/components/AddInvestmentModal.tsx

sed -i '1699 s/px-8 py-2 rounded-\[4px\] text-\[13px\]/w-[75px] h-[36.8px] p-[10px_20px] rounded-[4px] text-[14px]/' src/components/AddInvestmentModal.tsx
sed -i '1709 s/px-6 py-2 rounded-\[4px\] border/w-[87.77px] h-[36.8px] p-[10px_20px] rounded-[4px] border text-[14.8px]/g' src/components/AddInvestmentModal.tsx
sed -i '1709 s/text-\[13px\]//g' src/components/AddInvestmentModal.tsx

