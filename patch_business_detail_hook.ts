import fs from 'fs';

let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetImport = `import { formatINR } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { formatINR } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [showSuccess, setShowSuccess] = useState(false);`;
const replacementUse = `  const [showSuccess, setShowSuccess] = useState(false);

  useMobileBackNavigation(currentView !== "menu", () => setCurrentView("menu"));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
console.log("Success BusinessDetail");
