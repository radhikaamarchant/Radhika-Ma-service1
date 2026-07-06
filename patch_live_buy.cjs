const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');
content = content.replace(
  />\s*BUY\s*<\/button>/g,
  '>\n                            ADD\n                          </button>'
);
fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
