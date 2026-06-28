import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
content = content.replace(/text-green-600/g, 'text-kite-green');
fs.writeFileSync('src/pages/AdminPage.tsx', content);
