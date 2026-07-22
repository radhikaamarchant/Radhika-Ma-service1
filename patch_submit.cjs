const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const sellLogic = `
      if (orderMode === "SELL") {
        formData.investorIds.forEach((invId) => {
          let remainingQtyToSell = parseInt(formData.quantity) || 0;
          const activeInvs = state.investments.filter(
            (inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active"
          ).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

          for (const inv of activeInvs) {
            if (remainingQtyToSell <= 0) break;
            const invQty = inv.quantity || (selectedBusiness.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : 0);
            if (invQty <= 0) continue;

            const ratio = Math.min(invQty, remainingQtyToSell) / (parseInt(formData.quantity) || 1);
            const rmasFee = comms.fromInvestor * ratio;
            const happyTax = comms.fromBusiness * ratio;
            
            if (invQty <= remainingQtyToSell) {
               remainingQtyToSell -= invQty;
               const grossPayout = currentMarketPrice * invQty;
               dispatch({
                 type: "UPDATE_INVESTMENT",
                 payload: {
                   ...inv,
                   status: "completed",
                   payoutDetails: {
                     rmasCommission: rmasFee,
                     happyIncomeTax: happyTax,
                     totalCredited: grossPayout - rmasFee - happyTax,
                     payoutDate: new Date().toISOString().split("T")[0],
                     rmasMarketCover: 0
                   }
                 }
               });
            } else {
               const sellQty = remainingQtyToSell;
               const keepQty = invQty - sellQty;
               const avgPrice = inv.amount / invQty;
               const grossPayout = currentMarketPrice * sellQty;
               
               dispatch({
                 type: "UPDATE_INVESTMENT",
                 payload: {
                   ...inv,
                   quantity: keepQty,
                   amount: avgPrice * keepQty
                 }
               });
               
               dispatch({
                 type: "ADD_INVESTMENT",
                 payload: {
                   ...inv,
                   id: \`inv\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
                   quantity: sellQty,
                   amount: avgPrice * sellQty,
                   status: "completed",
                   payoutDetails: {
                     rmasCommission: rmasFee,
                     happyIncomeTax: happyTax,
                     totalCredited: grossPayout - rmasFee - happyTax,
                     payoutDate: new Date().toISOString().split("T")[0],
                     rmasMarketCover: 0
                   }
                 }
               });
               
               remainingQtyToSell = 0;
            }
          }
        });
      } else {
        formData.investorIds.forEach((invId, idx) => {
          const newInvestment: Investment = {
            id: \`inv\${Date.now()}_\${idx}\`,
            businessId: formData.businessId,
            investorId: invId,
            amount: amount,
            quantity: formData.quantity,
            timePeriodMonths: parseInt(formData.timePeriodMonths),
            interestRate: parseFloat(expectedRoi) || selectedBusiness.interestRate,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            adminCommissionInvestor: comms.fromInvestor,
            adminCommissionBusiness: comms.fromBusiness,
            status: "active",
          };
          dispatch({ type: "ADD_INVESTMENT", payload: newInvestment });
        });
        if (amount >= selectedBusiness.fundingRequired) {
          dispatch({
            type: "UPDATE_BUSINESS_STATUS",
            payload: { id: formData.businessId, status: "funded" },
          });
        }
      }
`;

content = content.replace(
  /formData\.investorIds\.forEach\(\(invId, idx\) => \{[\s\S]*?if \(amount >= selectedBusiness\.fundingRequired\) \{[\s\S]*?\}\s*\}/,
  sellLogic
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', content);
console.log("Patched submit logic");
