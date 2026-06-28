import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(/ dark:text-\[#E8E8E8\]/g, '');
content = content.replace(/ dark:group-hover:text-\[#E8E8E8\]/g, '');
content = content.replace(/ dark:hover:text-\[#E8E8E8\]/g, '');
content = content.replace(/ dark:bg-\[#E8E8E8\]/g, ''); // bg-black will be handled by css? Wait.
content = content.replace(/ dark:bg-\[#2A2A2A\]/g, '');
content = content.replace(/ dark:hover:bg-\[#2A2A2A\]/g, '');
content = content.replace(/ dark:border-\[#333333\]/g, '');

content = content.replace(/bg-gray-100(?! dark:)/g, 'bg-gray-100 dark:bg-kite-border-soft');
content = content.replace(/hover:bg-gray-100(?! dark:)/g, 'hover:bg-gray-100 dark:hover:bg-kite-border-soft');

// The active indicator line uses bg-black.
// Let's check how bg-black is handled in index.css
// :root.dark { --black-color: #FFFFFF; }
// So bg-black in dark mode will use --black-color and become white! We don't need dark:bg-xyz for it.

fs.writeFileSync('src/components/Sidebar.tsx', content);
