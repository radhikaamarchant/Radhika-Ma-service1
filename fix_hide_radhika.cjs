const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const regex = /<div className="w-full bg-white dark:bg-kite-bg dark:md:bg-\[#181818\] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">\s*\{\/\* Header and Tabs \*\/\}\s*<div className="bg-white dark:bg-kite-bg dark:md:bg-\[#181818\] pt-4 px-4 md:px-6 relative z-10 border-b border-kite-border md:border-none">/;

const replacement = `<div className="w-full bg-white dark:bg-kite-bg dark:md:bg-[#181818] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">
                <style>{\`
                  @media (max-width: 767px) {
                    .mobile-header-safe {
                      display: none !important;
                    }
                  }
                \`}</style>
                {/* Header and Tabs */}
                <div className="bg-white dark:bg-kite-bg dark:md:bg-[#181818] pt-8 md:pt-4 px-4 md:px-6 relative z-10 border-b border-kite-border md:border-none">`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Hidden Radhika bar and adjusted padding.");
} else {
  console.log("Regex not found.");
}
