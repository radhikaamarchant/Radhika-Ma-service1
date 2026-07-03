import fs from 'fs';

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const targetToMove = `  useMobileBackNavigation(viewMode === "add-step-1", () => setViewMode("list"));
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
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));`;

code = code.replace(targetToMove, '');

const insertTarget = `  const [formData, setFormData] = useState({
    investorId: "",
    name: "",
    bankName: INDIAN_BANKS[0],
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    rmasServiceCharge: "",
  });`;

const replacement = `  const [formData, setFormData] = useState({
    investorId: "",
    name: "",
    bankName: INDIAN_BANKS[0],
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    rmasServiceCharge: "",
  });

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
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));`;

code = code.replace(insertTarget, replacement);
fs.writeFileSync('src/pages/Investors.tsx', code);
console.log("Success");
