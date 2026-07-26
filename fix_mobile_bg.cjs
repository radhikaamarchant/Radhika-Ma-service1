const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const regex = /\{\/\* Mobile Holdings List \(Matches Kite App\) \*\/\}\s*<div className="block md:hidden pb-32">([\s\S]*?)\{\/\* Kite Style Top Summary Card - Full Width on Mobile \*\/\}\s*<div className="px-4 py-3 mb-2 mt-2">\s*<div className="bg-\[#ececed\] dark:bg-\[#1e1e1e\] rounded-lg border border-gray-300 dark:border-gray-700 shadow-none p-4">([\s\S]*?)<\/div>\s*<\/div>/;

if (content.match(regex)) {
  const replacement = `{/* Mobile Holdings List (Matches Kite App) */}
                    <div className="block md:hidden pb-32 bg-white dark:bg-black">$1{/* Kite Style Top Summary Card - Full Width on Mobile */}
                          <div className="bg-[#ececed] dark:bg-[#1a1a1a] pb-4 pt-2 px-4">
                            <div className="bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-4">$2</div>
                          </div>`;
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Updated mobile backgrounds.");
} else {
  console.log("Regex didn't match.");
}
