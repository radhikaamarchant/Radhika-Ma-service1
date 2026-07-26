const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const oldMobile = `const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\\D/g, "");
    const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";
    setFormData({ ...formData, amount: formatted });
  };`;

const newMobile = `const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const numeric = raw ? Number(raw) : 0;
    const formatted = raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "";
    setFormData({ ...formData, amount: formatted });
  };`;

content = content.replace(oldMobile, newMobile);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Fixed mobile amount change.");
