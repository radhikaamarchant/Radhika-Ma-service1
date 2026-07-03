import fs from 'fs';

let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const targetImport = `import { MarketTrendCell } from "../components/MarketTrendCell";`;
const replacementImport = `import { MarketTrendCell } from "../components/MarketTrendCell";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";`;

code = code.replace(targetImport, replacementImport);

const targetUse = `  const [ownerSearch, setOwnerSearch] = useState("");`;
const replacementUse = `  const [ownerSearch, setOwnerSearch] = useState("");
  
  useMobileBackNavigation(!!selectedBusinessId, () => setSelectedBusinessId(null));
  useMobileBackNavigation(viewMode === "add-step-1", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "add-step-2", () => setViewMode("add-step-1"));
  useMobileBackNavigation(showOwnerSelect, () => setShowOwnerSelect(false));
`;

code = code.replace(targetUse, replacementUse);
fs.writeFileSync('src/pages/Businesses.tsx', code);
console.log("Success Businesses");
