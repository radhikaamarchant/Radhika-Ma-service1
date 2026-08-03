const fs = require('fs');
const code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');
const match = code.match(/const renderPremiumBusinessDetails = \(business: Business\) => \{([\s\S]*?)\};\n\n  const renderBusinessDetails/);
if (match) {
    fs.writeFileSync('premium_fn.txt', match[0]);
}
