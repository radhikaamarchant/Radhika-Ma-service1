const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

code = code.replace(/if \(!selectedBusiness \|\| !formData\.investorId\) \{/, 'if (!selectedBusiness || formData.investorIds.length === 0) {');
code = code.replace(/alert\("Please select both a business and an investor\."\);/, 'alert("Please select both a business and at least one investor.");');

code = code.replace(/const newInvestment: Investment = {[\s\S]*?status: "active",\n    };/g, '');

code = code.replace(/dispatch\(\{ type: "ADD_INVESTMENT", payload: newInvestment \}\);/g, `formData.investorIds.forEach((invId, idx) => {
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
      });`);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log('Replaced successfully');
