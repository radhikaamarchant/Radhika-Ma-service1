const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
content = content.replace(/key=\{`\$\{app\.id\}-\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 5\)\}`\}/g, 'key={`${app.id}-${i}`}');
fs.writeFileSync('src/pages/Investors.tsx', content);

let contentBids = fs.readFileSync('src/pages/Bids.tsx', 'utf-8');
contentBids = contentBids.replace(/key=\{`\$\{ipo\.id\}-\$\{_idx\}`\}/g, 'key={`${ipo.id}-${_idx}`}');
// Bids is fine since it uses idx.

console.log("Fixed random keys");
