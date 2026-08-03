const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const targetStr = `    let authorities = 0;
    let investmentsCommission = 0;
    
    let brokerage = 0;
    let hpgTax = 0;`;

const newStr = `    let authorities = 0;
    let investmentsCommission = 0;
    
    // brokerage is already declared above
    let hpgTax = 0;`;

// We also need to move the declaration above the investor loop
const targetStr2 = `    let investorFees = 0;
    state.investors.forEach(i => {`;

const newStr2 = `    let investorFees = 0;
    let brokerage = 0;
    state.investors.forEach(i => {`;

code = code.replace(targetStr, newStr);
code = code.replace(targetStr2, newStr2);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
console.log("Fixed AdminPage declaration");
