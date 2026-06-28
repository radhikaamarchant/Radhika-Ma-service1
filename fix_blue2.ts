import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Fix primary background
content = content.replace(/bg-\[#1976D2\]/g, 'bg-kite-blue');
content = content.replace(/hover:bg-blue-600/g, 'hover:opacity-90');

// Fix the dark text 64B5F6 since text-kite-blue is enough
content = content.replace(/dark:text-\[#64B5F6\]/g, '');

fs.writeFileSync('src/pages/AdminPage.tsx', content);
