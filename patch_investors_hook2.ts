import fs from 'fs';

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const targetUse = `  useMobileBackNavigation(!!pdfProfitSlip, () => setPdfProfitSlip(null));`;
const replacementUse = `  useMobileBackNavigation(!!pdfProfitSlip, () => setPdfProfitSlip(null));
  useMobileBackNavigation(showOwnerSelect, () => setShowOwnerSelect(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/Investors.tsx', code);
console.log("Success Investors 2");
