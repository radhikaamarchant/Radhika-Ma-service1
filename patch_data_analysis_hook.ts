import fs from 'fs';

let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [addModalBusinessId, setAddModalBusinessId] = useState("");`;
const replacementUse = `  const [addModalBusinessId, setAddModalBusinessId] = useState("");
  useMobileBackNavigation(!!selectedBusiness, () => setSelectedBusiness(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Success DataAnalysis");
