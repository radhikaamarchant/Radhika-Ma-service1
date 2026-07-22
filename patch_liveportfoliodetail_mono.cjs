const fs = require('fs');
let code = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

code = code.replace(
  /<span className="font-mono">([\s\S]*?)<\/span>/g,
  '<span>$1</span>'
);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', code);
