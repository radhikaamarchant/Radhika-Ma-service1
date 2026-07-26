const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Update Header and Tabs to be grey on mobile
content = content.replace(
  /\{\/\* Header and Tabs \*\/\}\s*<div className="bg-white dark:bg-kite-bg dark:md:bg-\[#181818\] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-b border-kite-border md:border-none">/,
  `{/* Header and Tabs */}
                <div className="bg-[#ececed] md:bg-white dark:bg-[#1a1a1a] dark:md:bg-[#181818] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-none md:border-none">`
);

// We need to also ensure the Desktop table area doesn't have a weird background gap, but it's hidden on mobile.
// Wait, the "Portfolio" header has a back button that might have `hover:bg-kite-bg`. It's fine.

// Let's also check the container of the tabs
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated header and tabs bg");
