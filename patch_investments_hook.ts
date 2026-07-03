import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] = useState(false);`;
const replacementUse = `  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] = useState(false);
  
  useMobileBackNavigation(showAddForm, () => { setShowAddForm(false); setIsFromAnalysis(false); });
  useMobileBackNavigation(showBusinessSelect, () => setShowBusinessSelect(false));
  useMobileBackNavigation(showInvestorSelect, () => setShowInvestorSelect(false));
  useMobileBackNavigation(!!selectedInvestment, () => setSelectedInvestment(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
