import fs from 'fs';

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const targetImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [searchTerm, setSearchTerm] = useState("");`;
const replacementUse = `  const [searchTerm, setSearchTerm] = useState("");

  useMobileBackNavigation(!!selectedBusiness, () => setSelectedBusiness(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Success Dashboard");
