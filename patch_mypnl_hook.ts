import fs from 'fs';

let code = fs.readFileSync('src/pages/MyPnL.tsx', 'utf8');

const targetImport = `import { formatINR } from "../utils/MarketSimulationContext";`;
const replacementImport = `import { formatINR } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [selectedBill, setSelectedBill] = useState<StatementEntry | null>(null);`;
const replacementUse = `  const [selectedBill, setSelectedBill] = useState<StatementEntry | null>(null);

  useMobileBackNavigation(showStatement, () => setShowStatement(false));
  useMobileBackNavigation(!!selectedBill, () => setSelectedBill(null));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/MyPnL.tsx', code);
console.log("Success MyPnL");
