const fs = require('fs');
let code = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

const targetAdmin = `        if (inv.payoutDetails.rmasSubsidyPays) {
          balance -= inv.payoutDetails.rmasSubsidyPays;
        }`;
const injectAdmin = `        if (inv.payoutDetails.rmasSubsidyPays) {
          balance -= inv.payoutDetails.rmasSubsidyPays;
        }
        if (inv.payoutDetails.hpgSahayPays) {
          balance -= inv.payoutDetails.hpgSahayPays;
        }`;

code = code.replace(targetAdmin, injectAdmin);

const targetBiz = `          const businessBurden =
            inv.payoutDetails.totalCredited +
            (inv.payoutDetails.rmasCommission || 0) +
            (inv.payoutDetails.happyIncomeTax || 0) +
            (inv.payoutDetails.rmasPrematurePenalty || 0) -
            (inv.payoutDetails.rmasSubsidyPays || 0);`;
const injectBiz = `          const businessBurden =
            inv.payoutDetails.totalCredited +
            (inv.payoutDetails.rmasCommission || 0) +
            (inv.payoutDetails.happyIncomeTax || 0) +
            (inv.payoutDetails.rmasPrematurePenalty || 0) -
            (inv.payoutDetails.rmasSubsidyPays || 0) -
            (inv.payoutDetails.hpgSahayPays || 0);`;

code = code.replace(targetBiz, injectBiz);

fs.writeFileSync('src/utils/bankBalance.ts', code);
