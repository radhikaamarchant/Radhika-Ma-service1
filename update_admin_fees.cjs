const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetStr = `    state.investors.forEach(i => {
      if (i.id !== "admin_investor") {
        investorFees += (i.rmasServiceCharge || 0);
      }
    });`;

const newStr = `    state.investors.forEach(i => {
      if (i.id !== "admin_investor") {
        investorFees += (i.rmasServiceCharge || 0);
      }
      if (i.fundHistory) {
        i.fundHistory.forEach(f => {
          if (f.category === "tax" && f.type === "WITHDRAW") {
            brokerage += f.amount;
          }
        });
      }
    });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/pages/AdminPage.tsx', code);
  console.log("Updated AdminPage fees logic.");
} else {
  console.error("Target string not found in AdminPage.tsx.");
}
