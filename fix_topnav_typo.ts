import fs from 'fs';
let content = fs.readFileSync('src/components/TopNav.tsx', 'utf8');
content = content.replace('{ id: "pnl" as View, label: "MY P{ id: "pnl" as View, label: "MY P&L" },L" },', '{ id: "pnl" as View, label: "MY P&L" },');
fs.writeFileSync('src/components/TopNav.tsx', content);
console.log("Fixed TopNav typo");
