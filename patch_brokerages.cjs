const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Enable inputs in SELL mode by removing `disabled={orderMode === "SELL"}`
content = content.replace(/disabled=\{orderMode === "SELL"\}/g, '');

// Rename BSE Brokrage to HPG Tax conditionally
content = content.replace(
  /<span>BSE Brokrage<\/span>/g,
  `<span>{orderMode === "SELL" && orderTab === "CAP" ? "HPG Tax" : "BSE Brokrage"}</span>`
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched brokerages");
