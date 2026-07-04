import fs from 'fs';
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

code = code.replace(
  `  useMobileBackNavigation(showAddForm, () => { setShowAddForm(false); setIsFromAnalysis(false); });`,
  ``
);

code = code.replace(
  `        <AddInvestmentModal \n          isOpen={showAddForm}\n          onClose={() => {\n            setShowAddForm(false);\n            setAddModalBusinessId("");\n            setAddModalInvestorId("");\n          }}`,
  `        <AddInvestmentModal \n          isOpen={showAddForm}\n          onClose={() => {\n            setShowAddForm(false);\n            setIsFromAnalysis(false);\n            setAddModalBusinessId("");\n            setAddModalInvestorId("");\n          }}`
);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success Patch Investments");
