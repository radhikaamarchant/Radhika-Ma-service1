const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
  /<div className="bg-transparent md:bg-white md:dark:bg-kite-surface md:border-y md:border-kite-border">/g,
  `<div className="bg-white dark:bg-[#14212b] min-h-screen md:bg-white md:dark:bg-kite-surface md:border-y md:border-kite-border">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated positions wrapper bg.");
