const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const headerOld = '<div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0 z-30 md:sticky md:top-0 bg-white dark:bg-kite-bg">';
const headerNew = '<div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0 bg-white dark:bg-kite-bg">';
if (content.includes(headerOld)) {
    content = content.replace(headerOld, headerNew);
}

const extractRegex = /<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">[\s\S]*?\{\/\* DESKTOP HEADER \*\/\}\s*<div className="hidden md:flex items-center px-4 bg-\[#F9F9F9\] dark:bg-\[#1a1a1a\] border-b border-kite-border md:sticky md:top-\[68px\] z-20">([\s\S]*?)<\/div>[\s\S]*?\{filteredBusinesses\.map/;

const match = content.match(extractRegex);
if (match) {
    const desktopHeaderInner = match[1];
    
    // Remove DESKTOP HEADER from its original place
    const desktopHeaderFull = `<div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border md:sticky md:top-[68px] z-20">${desktopHeaderInner}</div>`;
    content = content.replace(`{/* DESKTOP HEADER */}\n                  ${desktopHeaderFull}`, '');
    
    // We also need to fix if the spacing is a bit off
    if (content.includes(desktopHeaderFull)) {
        content = content.replace(`{/* DESKTOP HEADER */}`, '');
        content = content.replace(desktopHeaderFull, '');
    } else {
        // use regex to remove
        content = content.replace(/\{\/\* DESKTOP HEADER \*\/\}\s*<div className="hidden md:flex items-center px-4 bg-\[#F9F9F9\] dark:bg-\[#1a1a1a\] border-b border-kite-border md:sticky md:top-\[68px\] z-20">[\s\S]*?<\/div>/, '');
    }
    
    // Now, wrap Header Section and insert DESKTOP HEADER right after it.
    const headerStartStr = `{/* Header Section */}\n            <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0 bg-white dark:bg-kite-bg">`;
    const newHeaderStartStr = `<div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg shadow-sm">\n              ${headerStartStr}`;
    content = content.replace(headerStartStr, newHeaderStartStr);
    
    // insert right before `<div className="w-full bg-transparent...`
    const listContainerRegex = /(<\/div>\s*<\/div>\{\" \"\}\s*)<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">/;
    
    const newDesktopHeader = `
              {/* DESKTOP HEADER (Moved to be sticky together) */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
${desktopHeaderInner}
              </div>
            </div>
            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">`;
            
    content = content.replace(listContainerRegex, newDesktopHeader);
    
    fs.writeFileSync('src/pages/Businesses.tsx', content);
    console.log("Successfully reorganized sticky headers!");
} else {
    console.log("Could not match the regex for DESKTOP HEADER extraction.");
}
