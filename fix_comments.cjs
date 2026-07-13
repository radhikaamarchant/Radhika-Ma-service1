const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
content = content.replace('<!-- <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Bio</h3> -->', '');
content = content.replace('<!-- <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">Full Address</h3> -->', '');
fs.writeFileSync('src/pages/Investors.tsx', content);
