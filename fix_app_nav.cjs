const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Ensure MobileBottomNav container has a fixed height h-[56px] for safety
content = content.replace(
  /<div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-\[100\] shadow-\[0_-2px_10px_rgba\(0,0,0,0\.02\)\] footer-nav">/,
  `<div className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] footer-nav">`
);

fs.writeFileSync('src/App.tsx', content);

let invContent = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
invContent = invContent.replace(
  /bottom-\[56px\]/,
  `bottom-[56px]`
);
fs.writeFileSync('src/pages/Investors.tsx', invContent);

console.log("Fixed App nav height");
