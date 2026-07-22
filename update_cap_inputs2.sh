#!/bin/bash
sed -i '1582 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1582 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1594 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1594 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1630 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1630 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

sed -i '1675 s/w-full bg-white/w-[172.18px] h-[44.5px] p-[10px_15px] bg-white/' src/components/AddInvestmentModal.tsx
sed -i '1675 s/px-3 py-2 //g' src/components/AddInvestmentModal.tsx

# Also, there's a mobile code around 1038, 1049, etc. which I shouldn't touch since it's mobile.
