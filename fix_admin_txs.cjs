const fs = require('fs');
let content = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

// Replace business registration
content = content.replace(
`    businesses.forEach((b) => {
      if (b.id !=="admin_business" && b.registrationFee) {
        transactions.push({
          id: \`tx_biz_reg_\${b.id}\`,
          date: b.registrationDate || new Date().toISOString(),
          title: \`Business Registration Fee\`,
          description: \`From \${b.name}\`,
          amount: b.registrationFee,
          type:"CREDIT",
          category:"commission",
        });
      }
    });`,
`    businesses.forEach((b) => {
      if (b.id !=="admin_business" && b.registrationFee) {
        transactions.push({
          id: \`tx_biz_reg_\${b.id}\`,
          date: b.registrationDate || new Date().toISOString(),
          title: \`REGISTER BUSINESS\`,
          description: b.name,
          amount: b.registrationFee,
          type:"CREDIT",
          category:"commission",
        });
      }
    });`
);

// Replace investor registration
content = content.replace(
`    investors.forEach((i) => {
      if (i.id !=="admin_investor" && i.rmasServiceCharge) {
        transactions.push({
          id: \`tx_inv_reg_\${i.id}\`,
          date: i.joinDate || new Date().toISOString(),
          title: \`Investor Registration Fee\`,
          description: \`From \${i.name}\`,
          amount: i.rmasServiceCharge,
          type:"CREDIT",
          category:"commission",
        });
      }
    });`,
`    investors.forEach((i) => {
      if (i.id !=="admin_investor" && i.rmasServiceCharge) {
        transactions.push({
          id: \`tx_inv_reg_\${i.id}\`,
          date: i.joinDate || new Date().toISOString(),
          title: \`REGISTER INVESTOR\`,
          description: i.name,
          amount: i.rmasServiceCharge,
          type:"CREDIT",
          category:"commission",
        });
      }
    });`
);

// Replace investment commission logic
content = content.replace(
`    investments.forEach((inv) => {
      const b = businesses.find((b) => b.id === inv.businessId);
      const i = investors.find((i) => i.id === inv.investorId);

      if (inv.status ==="completed" && inv.payoutDetails) {
        transactions.push({
          id: \`tx_\${inv.id}_comm\`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: \`RMAS Commission Booked\`,
          description: \`From settlement of \${b?.name} and \${i?.name}\`,
          amount: inv.payoutDetails.rmasCommission,
          type:"CREDIT",
          category:"commission",
        });
      }`,
`    investments.forEach((inv) => {
      const b = businesses.find((b) => b.id === inv.businessId);
      const i = investors.find((i) => i.id === inv.investorId);
      
      const qtyText = inv.quantity ? \`\${inv.quantity} Qty\` : \`Amt: ₹\${inv.amount}\`;

      if (inv.adminCommissionInvestor || inv.adminCommissionBusiness) {
        const totalBuyComm = (inv.adminCommissionInvestor || 0) + (inv.adminCommissionBusiness || 0);
        transactions.push({
          id: \`tx_\${inv.id}_buy_comm\`,
          date: inv.startDate || new Date().toISOString(),
          title: \`BUY\`,
          description: \`\${b?.name || "Unknown"} | \${i?.name || "Unknown"} | \${qtyText}\`,
          amount: totalBuyComm,
          type:"CREDIT",
          category:"commission",
        });
      }

      if (inv.status ==="completed" && inv.payoutDetails) {
        transactions.push({
          id: \`tx_\${inv.id}_comm\`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: \`SELL\`,
          description: \`\${b?.name || "Unknown"} | \${i?.name || "Unknown"} | \${qtyText}\`,
          amount: inv.payoutDetails.rmasCommission,
          type:"CREDIT",
          category:"commission",
        });
      }`
);

fs.writeFileSync('src/utils/bankBalance.ts', content);
console.log("Updated transactions in bankBalance.ts");
