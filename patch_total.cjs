const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const calcInjection = `  if (!isOpen) return null;

  const maxSellQty = orderMode === "SELL" && selectedBusiness 
    ? formData.investorIds.reduce((total, invId) => {
        const activeInvs = state.investments.filter((inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active");
        const invQty = activeInvs.reduce((sum, inv: any) => sum + (Number(inv.quantity) || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1), 0);
        return total + invQty;
      }, 0)
    : 0;

  const maxSellAmount = maxSellQty * (priceType === "MARKET" ? currentMarketPrice : (parseFloat(manualPrice) || currentMarketPrice));
`;

code = code.replace('  if (!isOpen) return null;', calcInjection);

const desktopTextOld = `<div className="text-[11px] text-gray-500 dark:text-[#8F8F8F] absolute -bottom-5">
                          {inputMode === "AMOUNT"
                            ? \`\${formData.quantity || 0} qty.\`
                            : \`₹\${formData.amount || 0}\`}
                        </div>`;

const desktopTextNew = `<div className="text-[11px] text-gray-500 dark:text-[#8F8F8F] absolute -bottom-5 whitespace-nowrap">
                          {inputMode === "AMOUNT"
                            ? \`\${formData.quantity || 0} qty.\`
                            : \`₹\${formData.amount || 0}\`}
                          {orderMode === "SELL" && selectedBusiness && formData.investorIds.length > 0 && (
                            <span className="ml-1.5 text-[#FF5722] dark:text-[#D4603B]">
                              (Max: {maxSellQty} Qty / ₹{Math.floor(maxSellAmount).toLocaleString("en-IN")})
                            </span>
                          )}
                        </div>`;

code = code.replace(desktopTextOld, desktopTextNew);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
