const fs = require('fs');
let code = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

const targetBizTx = `        if (i.status ==="completed" && i.payoutDetails) {
          transactions.push({
            id: \`tx_\${i.id}_payout\`,
            date: i.payoutDetails.payoutDate,
            title: \`Settlement Paid\`,
            description: \`To \${investor?.name}\`,
            amount:
              i.payoutDetails.totalCredited +
              (i.payoutDetails.rmasCommission || 0) +
              (i.payoutDetails.happyIncomeTax || 0),
            type:"DEBIT",
            category:"settlement",
          });
        }`;
const injectBizTx = `        if (i.status ==="completed" && i.payoutDetails) {
          transactions.push({
            id: \`tx_\${i.id}_payout\`,
            date: i.payoutDetails.payoutDate,
            title: \`Settlement Paid\`,
            description: \`To \${investor?.name}\`,
            amount:
              i.payoutDetails.totalCredited +
              (i.payoutDetails.rmasCommission || 0) +
              (i.payoutDetails.happyIncomeTax || 0),
            type:"DEBIT",
            category:"settlement",
          });
          if (i.payoutDetails.hpgSahayPays) {
            transactions.push({
              id: \`tx_\${i.id}_hpg_sahay\`,
              date: i.payoutDetails.payoutDate,
              title: \`HPG Sahay Kendra\`,
              description: \`Subsidy from Admin\`,
              amount: i.payoutDetails.hpgSahayPays,
              type:"CREDIT",
              category:"sahay",
            });
          }
        }`;

code = code.replace(targetBizTx, injectBizTx);
fs.writeFileSync('src/utils/bankBalance.ts', code);
