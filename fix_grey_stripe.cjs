const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Change the summary card wrapper to have pb-0 instead of pb-4 so there is no grey stripe below the card
content = content.replace(
  /<div className="bg-\[#ececed\] dark:bg-\[#1a1a1a\] pb-4 pt-2 px-4">/g,
  `<div className="bg-[#ececed] dark:bg-[#1a1a1a] pb-0 pt-2 px-4">`
);

// Actually, wait, let's also remove the shadow from the summary card and make the bottom rounded corners 0 if it connects directly to the white list. But wait, if it has a shadow-none and border, the bottom border will merge with the list? 
// Let's just make the padding below the card 0.
content = content.replace(
  /<div className="bg-white dark:bg-\[#2a2a2a\] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-4">/g,
  `<div className="bg-white dark:bg-[#2a2a2a] rounded-t-lg rounded-b-none border-t border-l border-r border-gray-300 dark:border-gray-700 shadow-none p-4 relative">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed grey stripe below summary card.");
