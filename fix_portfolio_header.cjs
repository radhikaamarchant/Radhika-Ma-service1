const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldContainer = '<div className="w-full bg-white dark:bg-kite-bg dark:md:bg-[#181818] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">';
const newContainer = '<div className="w-full bg-white dark:bg-kite-bg dark:md:bg-[#181818] md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:bottom-[calc(56px+env(safe-area-inset-bottom))] max-md:z-[45] max-md:overflow-y-auto">';

const oldHeader = '<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(32px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none">';
const newHeader = '<div className="bg-[#ececed] md:bg-white dark:bg-[#1c2a37] dark:md:bg-[#181818] pt-[calc(12px+env(safe-area-inset-top))] md:pt-4 pb-2 md:pb-0 px-4 md:px-6 relative z-10 border-none md:border-none">';

if (content.includes(oldContainer)) {
  content = content.replace(oldContainer, newContainer);
  console.log("Container updated.");
} else {
  console.log("Could not find container.");
}

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log("Header updated.");
} else {
  console.log("Could not find header.");
}

fs.writeFileSync('src/pages/Investors.tsx', content);
