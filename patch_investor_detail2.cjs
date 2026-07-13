const fs = require('fs');

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

// 1. Import Landmark, ChevronDown, ChevronRight if not imported
if (!content.includes('Landmark')) {
  content = content.replace(
    'import {\n  ArrowLeft,',
    'import {\n  ArrowLeft,\n  Landmark,\n  ChevronDown,\n  ChevronRight as ChevronRightIcon,'
  );
  // Wait, ChevronRight might already be imported. Let's check.
}
