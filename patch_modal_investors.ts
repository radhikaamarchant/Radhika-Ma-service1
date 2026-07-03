import fs from 'fs';

let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');
const targetUse = `  const [showBusinessSelect, setShowBusinessSelect] = useState(false);`;
const replacementUse = `  const [showBusinessSelect, setShowBusinessSelect] = useState(false);

  useMobileBackNavigation(isOpen, onClose);
  useMobileBackNavigation(showBusinessSelect, () => setShowBusinessSelect(false));
  useMobileBackNavigation(showInvestorSelect, () => setShowInvestorSelect(false));
`;
if (code.includes(targetUse)) {
  code = code.replace(targetUse, replacementUse);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
} else {
  console.log("AddInvestmentModal hook insertion target not found");
}

let code2 = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
const targetUse2 = `  const [pdfProfitSlip, setPdfProfitSlip] = useState<{`;
const replacementUse2 = `  const [pdfProfitSlip, setPdfProfitSlip] = useState<{
    investor: Investor;
    investment: Investment;
    payout: NonNullable<Investment["payoutDetails"]>;
  } | null>(null);

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
// Let's replace the whole setPdfProfitSlip statement to be safe
const fullTarget2 = `  const [pdfProfitSlip, setPdfProfitSlip] = useState<{
    investor: Investor;
    investment: Investment;
    payout: NonNullable<Investment["payoutDetails"]>;
  } | null>(null);`;
if (code2.includes(fullTarget2)) {
  code2 = code2.replace(fullTarget2, replacementUse2);
  fs.writeFileSync('src/pages/Investors.tsx', code2);
} else {
  console.log("Investors hook insertion target not found");
}
