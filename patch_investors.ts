import fs from 'fs';

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
const targetUse = `  const [showVerifySuccess, setShowVerifySuccess] = useState(false);`;
const replacementUse = `  const [showVerifySuccess, setShowVerifySuccess] = useState(false);

  useMobileBackNavigation(viewMode === "add-step-1", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "add-step-2", () => setViewMode("add-step-1"));
  useMobileBackNavigation(viewMode === "withdraw-list", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "withdraw-calc", () => setViewMode("withdraw-list"));
  useMobileBackNavigation(viewMode === "withdraw-bank", () => setViewMode("withdraw-calc"));
  useMobileBackNavigation(viewMode === "banking-record", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "investor-detail", () => {
    setViewMode("list");
    setSelectedInvestor(null);
  });
  useMobileBackNavigation(!!pdfInvestor, () => setPdfInvestor(null));
  useMobileBackNavigation(!!pdfProfitSlip, () => setPdfProfitSlip(null));
  useMobileBackNavigation(showOwnerSelect, () => setShowOwnerSelect(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));
`;
if (code.includes(targetUse)) {
  code = code.replace(targetUse, replacementUse);
  fs.writeFileSync('src/pages/Investors.tsx', code);
}
