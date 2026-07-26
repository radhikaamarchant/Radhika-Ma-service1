const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// Fix 1: Negative Price Default
// Replace currentMarketPrice calculation
const oldPriceCalc = `const currentMarketPrice = selectedBusiness
    ? getCurrentMarketPrice(selectedBusiness, state.investments)
    : 0;`;

const newPriceCalc = `const rawMarketPrice = selectedBusiness
    ? getCurrentMarketPrice(selectedBusiness, state.investments)
    : 0;
  const currentMarketPrice = Math.abs(Number(rawMarketPrice.toFixed(2)));`;

content = content.replace(oldPriceCalc, newPriceCalc);

// Fix 2: Incorrect Amount/Qty calculation & Fix 3: Dynamic Required String
// Let's replace the whole block of functions related to input changes.
const oldFns = `const handleDesktopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleInputModeChange = (mode: "AMOUNT" | "QTY") => {
    setInputMode(mode);
  };

  const handlePriceTypeChange = (type: "MARKET" | "LIMIT") => {
    setPriceType(type);
    const newEffectivePrice =
      type === "MARKET"
        ? currentMarketPrice
        : parseFloat(manualPrice) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/\\D/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN") : "",
      }));
    } else {
      const amt = parseFloat(formData.amount.replace(/,/g, "")) || 0;
      const qty =
        newEffectivePrice > 0 ? Math.floor(amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty || ("" as any) }));
    }
  };

  const handleManualPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualPrice(val);
    const newEffectivePrice = parseFloat(val) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/\\D/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN") : "",
      }));
    } else {
      const amt = parseFloat(formData.amount.replace(/,/g, "")) || 0;
      const qty =
        newEffectivePrice > 0 ? Math.floor(amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty || ("" as any) }));
    }
  };`;

const newFns = `const handleDesktopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const numeric = raw ? Number(raw) : 0;

    if (inputMode === "AMOUNT") {
      const qty = effectivePrice > 0 ? (numeric / effectivePrice) : 0;
      setFormData({
        ...formData,
        amount: raw, // Store raw numeric string to avoid parsing issues, but wait, the component expects formatted string? Actually, let's keep it formatted if we want, but let's just use raw for amount and format on display if needed. Wait, we format it below.
        amount: raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
        quantity: qty ? Number(qty.toFixed(2)) : ("" as any),
      });
    } else {
      const amt = numeric * effectivePrice;
      setFormData({
        ...formData,
        quantity: raw ? numeric : ("" as any),
        amount: amt ? amt.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
      });
    }
  };

  const handleInputModeChange = (mode: "AMOUNT" | "QTY") => {
    setInputMode(mode);
  };

  const handlePriceTypeChange = (type: "MARKET" | "LIMIT") => {
    setPriceType(type);
    const newEffectivePrice =
      type === "MARKET"
        ? currentMarketPrice
        : Math.abs(parseFloat(manualPrice)) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/[^0-9.]/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
      }));
    } else {
      const amt = parseFloat(String(formData.amount).replace(/,/g, "")) || 0;
      const qty = newEffectivePrice > 0 ? (amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty ? Number(qty.toFixed(2)) : ("" as any) }));
    }
  };

  const handleManualPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive numbers
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setManualPrice(val);
    const newEffectivePrice = parseFloat(val) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/[^0-9.]/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
      }));
    } else {
      const amt = parseFloat(String(formData.amount).replace(/,/g, "")) || 0;
      const qty = newEffectivePrice > 0 ? (amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty ? Number(qty.toFixed(2)) : ("" as any) }));
    }
  };`;

content = content.replace(oldFns, newFns);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Replaced desktop functions.");
