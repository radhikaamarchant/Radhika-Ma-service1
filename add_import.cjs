const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

if (!content.includes('import { MobilePortfolioSummary }')) {
  content = content.replace(
    'import { SwipeButton }',
    'import { MobilePortfolioSummary } from "./MobilePortfolioSummary";\nimport { SwipeButton }'
  );
  fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
}
