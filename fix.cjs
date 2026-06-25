const fs = require('fs');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

const files = ['src/pages/Businesses.tsx', 'src/pages/DataAnalysis.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  content = replaceAll(content, 'dark:bg-[#111827]', 'dark:bg-kite-surface');
  content = replaceAll(content, 'dark:bg-[#0f172a]', 'dark:bg-kite-bg');
  content = replaceAll(content, 'dark:border-[#374151]', 'dark:border-kite-border');
  content = replaceAll(content, 'dark:text-[#9ca3af]', 'dark:text-kite-text-light');
  content = replaceAll(content, 'dark:text-[#f9fafb]', 'dark:text-kite-text');
  content = replaceAll(content, 'dark:text-[#d1d5db]', 'dark:text-kite-text');
  content = replaceAll(content, 'dark:hover:bg-[#1f2937]', 'dark:hover:bg-kite-border-soft');
  content = replaceAll(content, 'dark:hover:text-[#f9fafb]', 'dark:hover:text-kite-text');
  content = replaceAll(content, 'dark:focus:ring-[#f9fafb]', 'dark:focus:ring-white');
  content = replaceAll(content, 'dark:placeholder-gray-500', 'dark:placeholder-kite-text-light');
  
  content = replaceAll(content, 'text-[#444]', 'text-kite-text');
  content = replaceAll(content, 'text-[#888]', 'text-kite-text-light');
  content = replaceAll(content, 'bg-[#f9f9f9]', 'bg-kite-bg');
  content = replaceAll(content, 'border-[#e0e0e0]', 'border-kite-border');

  // Fix button text hidden
  // The toggle button unselected state might be using gray-500 or dark:text-kite-text
  
  fs.writeFileSync(file, content);
}
console.log("Done");
