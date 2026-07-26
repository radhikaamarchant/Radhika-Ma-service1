const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Add pb-24 to Mobile Holdings List container
content = content.replace(
  /\{\/\* Mobile Holdings List \(Matches Kite App\) \*\/\}\s*<div className="block md:hidden">/,
  `{/* Mobile Holdings List (Matches Kite App) */}
                    <div className="block md:hidden pb-24">`
);

// Replace the sticky bottom bar
const oldSticky = /<div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-\[#131415\] border-t border-kite-border-soft shadow-\[0_-2px_10px_rgba\(0,0,0,0\.05\)\] z-50 px-4 py-3 flex justify-between items-center md:hidden">/;

const newSticky = `<div className="fixed bottom-0 left-0 w-full z-[100] bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 flex justify-between items-center block md:hidden">`;

content = content.replace(oldSticky, newSticky);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Applied fixes");
