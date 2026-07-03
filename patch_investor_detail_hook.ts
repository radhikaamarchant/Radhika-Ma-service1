import fs from 'fs';

let code = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const targetImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [isEditingDetails, setIsEditingDetails] = useState(false);`;
const replacementUse = `  const [isEditingDetails, setIsEditingDetails] = useState(false);

  useMobileBackNavigation(isEditingDetails, () => setIsEditingDetails(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/components/InvestorDetail.tsx', code);
console.log("Success InvestorDetail");
