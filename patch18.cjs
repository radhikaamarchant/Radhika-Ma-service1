const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldHeader = `<h2 className="text-[16px] font-bold tracking-wide text-white/90">`;
const newHeader = `<h2 className="text-[16px] font-bold tracking-wide text-white">`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
  console.log("Patched successfully to text-white");
} else {
  console.log("Not found");
}
