const fs = require('fs');
let code = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

code = code.replace(
  /dark:text-\[#5B9A5D\] dark:bg-green-900\/20 dark:text-\[#5B9A5D\]/g,
  'dark:text-[#5B9A5D] dark:bg-green-900/20'
);

fs.writeFileSync('src/pages/Bids.tsx', code);
