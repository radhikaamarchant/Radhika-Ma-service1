const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const oldHeaderRegex = /<div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4">/;
const newHeaderStart = `<div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg shadow-sm">\n              <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0">`;

// Replace Header Start
content = content.replace(oldHeaderRegex, newHeaderStart);

// We need to extract the desktop header and place it immediately after the first header block
const extractRegex = /\{\/\* DESKTOP HEADER \*\/\}\s*<div className="hidden md:flex items-center px-4 bg-\[#F9F9F9\] dark:bg-\[#1a1a1a\] border-b border-kite-border">([\s\S]*?)<\/div>/;

const match = content.match(extractRegex);
if (match) {
    const desktopHeaderInner = match[1];
    
    // remove it from the list
    content = content.replace(extractRegex, '');
    
    const wrapperEndRegex = /(<\/div>\s*<\/div>\s*<\/div>)\s*<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">/;
    
    const newDesktopHeader = `</div>
              {/* DESKTOP HEADER (Moved to be sticky together) */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
${desktopHeaderInner}
              </div>
            </div>
            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">`;
            
    content = content.replace(wrapperEndRegex, newDesktopHeader);
    
    fs.writeFileSync('src/pages/Investors.tsx', content);
    console.log("Success replacing remnant!");
} else {
    console.log("Failed to match extractRegex.");
}

