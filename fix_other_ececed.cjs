const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
  '<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(32px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none">',
  '<div className="bg-[#f2f2f2] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(32px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none">'
);

content = content.replace(
  '<div className="absolute top-0 left-0 right-0 h-[106px] bg-[#ececed] dark:bg-[#1c2a37] z-0"></div>',
  '<div className="absolute top-0 left-0 right-0 h-[106px] bg-[#f2f2f2] dark:bg-[#1c2a37] z-0"></div>'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Replaced ececed with f2f2f2 in other places");
