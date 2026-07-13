const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

// Replace the malformed import block
content = content.replace(
  "import InvestorPreviewModal from './InvestorPreviewModal'; from \"../utils/AppContext\";",
  "import InvestorPreviewModal from './InvestorPreviewModal';"
);
content = content.replace(
  "import { useAppContext } from '../context/AppContext';",
  "import { useAppContext } from '../utils/AppContext';"
);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
