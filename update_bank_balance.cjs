const fs = require('fs');

let code = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

const targetStr = `          if (f.category === "tax" && f.type === "WITHDRAW") {
            transactions.push({
              id: \`tx_tax_\${f.id}\`,
              date: f.date,
              title: \`Tax Penalty - \${i.name}\`,
              description: f.description || "Inactivity Tax",
              amount: f.amount,
              type: "CREDIT",
              category: "commission"
            });
          }`;

const newStr = `          if (f.category === "tax" && f.type === "WITHDRAW") {
            transactions.push({
              id: \`tx_tax_\${f.id}\`,
              date: f.date,
              title: \`\${i.name} - invest penalty charge - \${f.description}\`,
              description: "Penalty Charge",
              amount: f.amount,
              type: "CREDIT",
              category: "commission"
            });
          }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/utils/bankBalance.ts', code);
  console.log("Updated Admin statement title.");
} else {
  console.error("Target string not found in Admin statement in bankBalance.ts.");
}

const targetStr2 = `            title: f.type === "ADD" ? "Funds Added" : "Funds Withdrawn",
            description: f.type === "ADD" ? "Added to account" : "Withdrawn to bank",`;

const newStr2 = `            title: f.category === "tax" ? \`RMAS KITE invest penalty charge - \${f.description}\` : (f.type === "ADD" ? "Funds Added" : "Funds Withdrawn"),
            description: f.category === "tax" ? "Inactivity Tax" : (f.type === "ADD" ? "Added to account" : "Withdrawn to bank"),`;

if (code.includes(targetStr2)) {
  code = code.replace(targetStr2, newStr2);
  fs.writeFileSync('src/utils/bankBalance.ts', code);
  console.log("Updated Investor statement title.");
} else {
  console.error("Target string not found in Investor statement in bankBalance.ts.");
}
