const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  
  const oldMobileHeader1 = `className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-[#121212] w-full md:hidden pt-3 px-4 pb-3"`;
  const newMobileHeader1 = `className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-kite-bg w-full md:hidden pt-3 px-4 pb-3"`;
  
  const oldMobileHeader2 = `className="bg-white dark:bg-[#1e1e1e] rounded-[4px] shadow-sm flex items-center px-3 py-2.5 mb-3 border border-gray-200 dark:border-[#2A2A2A]"`;
  const newMobileHeader2 = `className="bg-white dark:bg-kite-surface rounded-[4px] shadow-sm flex items-center px-3 py-2.5 mb-3 border border-gray-200 dark:border-kite-border"`;
  
  code = code.replace(oldMobileHeader1, newMobileHeader1);
  code = code.replace(oldMobileHeader2, newMobileHeader2);
  
  fs.writeFileSync(file, code);
  console.log(`Successfully updated ${file}!`);
}

updateFile('src/pages/Businesses.tsx');
updateFile('src/pages/Investors.tsx');
