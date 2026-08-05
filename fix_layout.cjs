const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace the main return wrapper
const oldMainWrapper = '<div className="flex-1 overflow-hidden bg-kite-bg flex flex-col h-full w-full">';
const newMainWrapper = '<div className="absolute inset-0 overflow-hidden bg-kite-bg flex flex-col">';

code = code.replace(oldMainWrapper, newMainWrapper);

// Replace mobile view wrapper
const oldMobileWrapper = '<div className="block md:hidden w-full h-full overflow-auto pb-[80px]">';
const newMobileWrapper = '<div className="flex md:hidden flex-col flex-1 overflow-auto pb-[80px]">';

code = code.replace(oldMobileWrapper, newMobileWrapper);

// Replace desktop view wrapper
const oldDesktopWrapper = '<div className="hidden md:flex flex-col h-full w-full bg-white dark:bg-kite-surface overflow-hidden">';
const newDesktopWrapper = '<div className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-kite-surface">';

code = code.replace(oldDesktopWrapper, newDesktopWrapper);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Layout fixed!");
