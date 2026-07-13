const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');
content = content.replace(
  '} from "lucide-react";',
  '  Landmark,\n  ChevronDown,\n} from "lucide-react";'
);
fs.writeFileSync('src/components/InvestorDetail.tsx', content);
