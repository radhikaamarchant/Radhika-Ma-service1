import fs from 'fs';

let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const targetImport = `import { formatINR } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { formatINR } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [showBusinessSelect, setShowBusinessSelect] = useState(false);`;
const replacementUse = `  const [showBusinessSelect, setShowBusinessSelect] = useState(false);

  useMobileBackNavigation(isOpen, onClose);
  useMobileBackNavigation(showBusinessSelect, () => setShowBusinessSelect(false));
  useMobileBackNavigation(showInvestorSelect, () => setShowInvestorSelect(false));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log("Success AddInvestmentModal");
