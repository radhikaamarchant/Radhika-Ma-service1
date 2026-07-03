import fs from 'fs';

let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const targetImport = `import { MobilePortfolioSummary } from "../components/MobilePortfolioSummary";`;
const replacementImport = `import { MobilePortfolioSummary } from "../components/MobilePortfolioSummary";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [pdfProfitSlip, setPdfProfitSlip] = useState<any>(null);`;
const replacementUse = `  const [pdfProfitSlip, setPdfProfitSlip] = useState<any>(null);

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
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/Investors.tsx', code);
console.log("Success Investors");
