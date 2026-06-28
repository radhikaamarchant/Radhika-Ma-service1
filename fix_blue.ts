import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Primary background
content = content.replace(/bg-\[#1976D2\] hover:bg-blue-600/g, 'bg-kite-blue hover:opacity-90');

// Text color
content = content.replace(/text-\[#1976D2\]/g, 'text-kite-blue');

// Border color
content = content.replace(/border-\[#1976D2\]/g, 'border-kite-blue');

// Also fix hover:bg-gray-100 to use kite-border-soft
content = content.replace(/hover:bg-gray-100(?! dark:)/g, 'hover:bg-gray-100 dark:hover:bg-kite-border-soft');

// Fix text-white
// Ensure it stays text-white in both, which bg-kite-blue handles perfectly.

// Let's also check Sidebar
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/text-\[#1976D2\]/g, 'text-kite-blue');
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
