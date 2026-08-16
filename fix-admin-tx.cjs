const fs = require('fs');
let code = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

const targetAdminTx = `      if (inv.status ==="completed" && inv.payoutDetails) {
        transactions.push({
          id: \`tx_\${inv.id}_comm\`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: \`SELL\`,
          description: \`\${b?.name || "Unknown"} | \${i?.name || "Unknown"} | \${qtyText}\`,
          amount: inv.payoutDetails.rmasCommission,
          type:"CREDIT",
          category:"commission",
        });
      }`;
const injectAdminTx = `      if (inv.status ==="completed" && inv.payoutDetails) {
        transactions.push({
          id: \`tx_\${inv.id}_comm\`,
          date: inv.payoutDetails.payoutDate || new Date().toISOString(),
          title: \`SELL\`,
          description: \`\${b?.name || "Unknown"} | \${i?.name || "Unknown"} | \${qtyText}\`,
          amount: inv.payoutDetails.rmasCommission,
          type:"CREDIT",
          category:"commission",
        });
        if (inv.payoutDetails.hpgSahayPays) {
          transactions.push({
            id: \`tx_\${inv.id}_hpg_sahay\`,
            date: inv.payoutDetails.payoutDate || new Date().toISOString(),
            title: \`HPG Sahay Kendra\`,
            description: \`Subsidy Paid to \${b?.name || "Unknown"}\`,
            amount: inv.payoutDetails.hpgSahayPays,
            type:"DEBIT",
            category:"sahay",
          });
        }
      }`;

code = code.replace(targetAdminTx, injectAdminTx);
fs.writeFileSync('src/utils/bankBalance.ts', code);
