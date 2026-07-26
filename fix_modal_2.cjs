const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const doubleAmount = `amount: raw, // Store raw numeric string to avoid parsing issues, but wait, the component expects formatted string? Actually, let's keep it formatted if we want, but let's just use raw for amount and format on display if needed. Wait, we format it below.
        amount: raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",`;

content = content.replace(doubleAmount, `amount: raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",`);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Fixed double amount key.");
