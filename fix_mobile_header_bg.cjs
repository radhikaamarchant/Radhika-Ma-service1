const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Change the main container background to grey on mobile, white on desktop
// The main container currently is: <div className="w-full bg-white dark:bg-kite-bg dark:md:bg-[#181818] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">
content = content.replace(
  /<div className="w-full bg-white dark:bg-kite-bg dark:md:bg-\[#181818\] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">/,
  `<div className="w-full bg-[#ececed] dark:bg-[#1a1a1a] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">`
);

// Change the Header and Tabs to transparent on mobile, white on desktop
content = content.replace(
  /<div className="bg-white dark:bg-kite-bg dark:md:bg-\[#181818\] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-b border-kite-border md:border-none">/,
  `<div className="bg-transparent md:bg-white md:dark:bg-kite-bg dark:md:bg-[#181818] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-b border-gray-300 dark:border-gray-700 md:border-none">`
);

// Update Mobile Holdings List Wrapper: it shouldn't have bg-white because we want the summary card inside it to be on transparent (grey inherited).
// Wait, the summary card is inside it. We want the list to be white.
// Let's modify the Mobile Holdings List Wrapper to just be transparent, and wrap the list itself in a white div.
