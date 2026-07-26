const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
  /<div className="relative bg-white dark:bg-black pt-4 pb-2 px-4">/g,
  `<div className="relative bg-white dark:bg-[#14212b] pt-4 pb-2 px-4">`
);

// We should also check the border of the card `dark:border-gray-700`. The user provided #2b414f for the card background. The border in the screenshot is barely visible. We can change it to `dark:border-transparent` or `dark:border-[#2b414f]`.
content = content.replace(
  /dark:bg-\[#2b414f\] rounded-lg border border-gray-300 dark:border-gray-700/g,
  `dark:bg-[#2b414f] rounded-lg border border-gray-300 dark:border-[#2b414f]`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated wrapper bg and border.");
