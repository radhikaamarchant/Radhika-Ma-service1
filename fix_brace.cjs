const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');
content = content.replace("/>, document.body)}}", "/>, document.body)}");
fs.writeFileSync('src/components/InvestorDetail.tsx', content);
