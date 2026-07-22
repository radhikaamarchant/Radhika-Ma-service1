const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const restoreStr = `
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentMarketPrice = selectedBusiness
    ? getCurrentMarketPrice(selectedBusiness, state.investments)
    : 0;

  const effectivePrice =
    priceType === "MARKET"
      ? currentMarketPrice
      : parseFloat(manualPrice) || currentMarketPrice;

  const desktopInputValue =
    inputMode === "AMOUNT" ? formData.amount : formData.quantity;

  const handleDesktopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\\D/g, "");
    const numeric = raw ? Number(raw) : 0;

    if (inputMode === "AMOUNT") {
      const qty = effectivePrice > 0 ? Math.floor(numeric / effectivePrice) : 0;
      setFormData({
        ...formData,
        amount: raw ? numeric.toLocaleString("en-IN") : "",
        quantity: qty || ("" as any),
      });
    } else {
      const amt = numeric * effectivePrice;
      setFormData({
        ...formData,
        quantity: raw ? numeric : ("" as any),
        amount: raw ? amt.toLocaleString("en-IN") : "",
      });
    }
  };

  const handleInputModeChange`;

content = content.replace(/const handleInputModeChange/, restoreStr);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
