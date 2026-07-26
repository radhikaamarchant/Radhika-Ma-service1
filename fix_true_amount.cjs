const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const trueAmtFn = `  const getTrueAmount = () => {
    const rawMarketPrice = selectedBusiness ? getCurrentMarketPrice(selectedBusiness, state.investments) : 0;
    const cmp = Math.abs(Number(rawMarketPrice.toFixed(2)));
    const efPrice = priceType === "MARKET" ? cmp : (Math.abs(parseFloat(manualPrice)) || cmp);
    const qty = Number(formData.quantity) || 0;
    return qty * efPrice;
  };

  const calculateCommissions = () => {
    const amount = getTrueAmount();`;

content = content.replace(`  const calculateCommissions = () => {
    const amount = getRawAmount(formData.amount);`, trueAmtFn);

// Replace other instances of getRawAmount(formData.amount) with getTrueAmount()
content = content.replace(/getRawAmount\(formData\.amount\)/g, "getTrueAmount()");

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Fixed true amount calculation.");
