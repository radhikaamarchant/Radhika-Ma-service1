import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

content = content.replace(/ md:bg-\[#F8F9FA\] dark:bg-kite-bg/g, '');
content = content.replace(/ md:bg-\[#F8F9FA\] md:dark:bg-kite-bg/g, '');

fs.writeFileSync('src/pages/AdminPage.tsx', content);
