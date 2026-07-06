const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
content = content.replace(
  /"bg-white dark:bg-kite-surface text-gray-500 border-kite-border hover:bg-gray-50"/g,
  '"bg-white dark:bg-kite-surface text-gray-500 border-kite-border hover:bg-gray-50 dark:hover:bg-[#202020]"'
);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched hover 1");
