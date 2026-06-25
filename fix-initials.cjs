const fs = require('fs');

const files = ['src/pages/Dashboard.tsx', 'src/pages/DataAnalysis.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{b\.name\.charAt\(0\)\}/g, "{b.name?.trim().charAt(0).toUpperCase() || 'B'}");
  // The user wanted bold and white, or a dark blue that contrasts well. Let's make it a nice blue circle with white text, or dark blue text.
  content = content.replace(/bg-\[#f0f6fc\] dark:bg-kite-blue\/20 flex-shrink-0 text-kite-blue dark:text-\[#7ab0ea\]/g, "bg-[#387ed1] text-white flex-shrink-0 font-bold");
  fs.writeFileSync(file, content);
}
console.log("Done");
