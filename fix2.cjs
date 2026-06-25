const fs = require('fs');
let file = 'src/pages/Businesses.tsx';
let content = fs.readFileSync(file, 'utf8');

// For unselected buttons
content = content.replace(/bg-white dark:bg-kite-surface text-gray-500 dark:text-kite-text/g, 'bg-white dark:bg-kite-bg text-gray-500 dark:text-kite-text');

fs.writeFileSync(file, content);
console.log("Done");
