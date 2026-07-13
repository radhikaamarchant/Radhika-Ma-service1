const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

if (!content.includes('import BusinessDetail from "../components/BusinessDetail";')) {
  content = content.replace(
    'import { INDIAN_BANKS } from "../utils/indianBanks";',
    'import { INDIAN_BANKS } from "../utils/indianBanks";\nimport BusinessDetail from "../components/BusinessDetail";'
  );
}

content = content.replace(
  '{viewMode === "list" && (',
  '{selectedBusinessId ? (\n          <BusinessDetail\n            businessId={selectedBusinessId}\n            onBack={() => setSelectedBusinessId(null)}\n          />\n        ) : viewMode === "list" && ('
);

fs.writeFileSync('src/pages/Businesses.tsx', content);
