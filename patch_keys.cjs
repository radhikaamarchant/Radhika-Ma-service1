const fs = require('fs');

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf-8');

content = content.replace(/ipos\.map\(\(ipo: any\) => \(/g, 'ipos.map((ipo: any, _idx: number) => (');
content = content.replace(/key=\{ipo\.id\}/g, 'key={`${ipo.id}-${_idx}`}');

content = content.replace(/commissions\.map\(\(c: any\) => \(/g, 'commissions.map((c: any, _cidx: number) => (');
content = content.replace(/key=\{c\.id\}/g, 'key={`${c.id}-${_cidx}`}');

fs.writeFileSync('src/pages/Bids.tsx', content);
console.log("Patched Bids.tsx keys");
