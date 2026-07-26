const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// handleDesktopInputChange
let oldStr1 = `const qty = effectivePrice > 0 ? (numeric / effectivePrice) : 0;
      setFormData({
        ...formData,
        amount: raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
        quantity: qty ? Number(qty.toFixed(2)) : ("" as any),
      });`;
let newStr1 = `const qty = effectivePrice > 0 ? Math.floor(numeric / effectivePrice) : 0;
      setFormData({
        ...formData,
        amount: raw ? numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "",
        quantity: qty ? qty : ("" as any),
      });`;
content = content.replace(oldStr1, newStr1);

// handlePriceTypeChange
let oldStr2 = `const amt = parseFloat(String(formData.amount).replace(/,/g, "")) || 0;
      const qty = newEffectivePrice > 0 ? (amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty ? Number(qty.toFixed(2)) : ("" as any) }));`;
let newStr2 = `const amt = parseFloat(String(formData.amount).replace(/,/g, "")) || 0;
      const qty = newEffectivePrice > 0 ? Math.floor(amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty ? qty : ("" as any) }));`;
content = content.replace(oldStr2, newStr2);
// There are two identical blocks like oldStr2, one in handlePriceTypeChange and one in handleManualPriceChange. The replace will replace the first one. Let's do a global replace or do it twice.

content = content.replace(oldStr2, newStr2); // replace the second one too

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Fixed qty calculation to whole numbers.");
