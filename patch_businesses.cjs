const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

code = code.replace(/FUND\s*<\/div>/, 'TRIGGER\n                  </div>');
code = code.replace(
  /\{formatINR\(business\.fundingRequired\)\}/g,
  "{business.triggerAmount ? formatINR(business.triggerAmount) : '-'}"
);
code = code.replace(
  /\{`₹\$\{formatLargeNumber\(totalInvested\)\}`\}/g,
  "{business.triggerAmount ? formatINR(business.triggerAmount) : '-'}"
);

fs.writeFileSync('src/pages/Businesses.tsx', code);
