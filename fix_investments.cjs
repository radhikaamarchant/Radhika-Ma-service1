const fs = require('fs');

let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// 1. Find the Action Bar
const actionBarRegex = /<div\s*className=\{\`flex items-center justify-between w-full py-3 px-4 w-full \$\{showAddForm \? "hidden md:flex" : "flex"\}\`\}\s*>([\s\S]*?)<\/div>\{""\}\s*<AnimatePresence>/;

const actionMatch = content.match(actionBarRegex);
if (!actionMatch) {
    console.log("Could not find action bar.");
    process.exit(1);
}

const actionBarContent = actionMatch[1];
const fullActionBar = `<div
        className={\`flex items-center justify-between w-full py-3 px-4 w-full \${showAddForm ?"hidden md:flex" :"flex"}\`}
      >${actionBarContent}</div>{""}`;


// 2. Find the Desktop Header
const desktopHeaderRegex = /\{\/\* DESKTOP HEADER \*\/\}\s*<div className="hidden md:flex flex-row items-stretch justify-between w-full px-4 text-\[11px\] text-kite-text-light tracking-wide font-normal bg-kite-surface border-b border-kite-border-soft">\s*<div className="w-4\/12 text-left py-2">Instrument<\/div>\s*<div className="w-1\/12 text-right py-2">Qty\.<\/div>\s*<div className="w-2\/12 text-right py-2">Avg\. cost<\/div>\s*<div className="w-2\/12 text-right py-2 pr-5">Cur\. val<\/div>\s*<div className="w-2\/12 text-right py-2 pl-5 border-l border-kite-vertical-divider">P&L<\/div>\s*<div className="w-1\/12 text-right py-2">Net chg\.<\/div>\s*<\/div>/;

const headerMatch = content.match(desktopHeaderRegex);
if (!headerMatch) {
    console.log("Could not find desktop header.");
    process.exit(1);
}

const fullDesktopHeader = headerMatch[0];

// Remove original desktop header
content = content.replace(fullDesktopHeader, '');

// Create the new combined sticky section
const newCombinedSection = `<div className="md:sticky md:top-0 z-30 bg-kite-surface dark:bg-kite-bg shadow-sm">
      <div
        className={\`flex items-center justify-between w-full py-3 px-4 w-full \${showAddForm ?"hidden md:flex" :"flex"}\`}
      >${actionBarContent}</div>
      ${fullDesktopHeader}
      </div>{""}
      <AnimatePresence>`;

// Replace the action bar with the combined section
content = content.replace(actionBarRegex, newCombinedSection);

fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Success replacing investments!");
