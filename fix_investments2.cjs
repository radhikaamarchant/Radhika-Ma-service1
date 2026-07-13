const fs = require('fs');

let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const searchBarStart = '<div\n        className={`flex items-center justify-between w-full py-3 px-4 w-full ${showAddForm ?"hidden md:flex" :"flex"}`}\n      >';
const animatePresenceStart = '<AnimatePresence>';

const sIdx = content.indexOf(searchBarStart);
const eIdx = content.indexOf(animatePresenceStart, sIdx);

if (sIdx === -1 || eIdx === -1) {
    console.log("Failed to find start or end index.");
    process.exit(1);
}

// Extract the action bar div content
const actionBarText = content.substring(sIdx, eIdx);

// Now for the header
const headerStr = '{/* DESKTOP HEADER */}\n          <div className="hidden md:flex flex-row items-stretch justify-between w-full px-4 text-[11px] text-kite-text-light tracking-wide font-normal bg-kite-surface border-b border-kite-border-soft">\n             <div className="w-4/12 text-left py-2">Instrument</div>\n             <div className="w-1/12 text-right py-2">Qty.</div>\n             <div className="w-2/12 text-right py-2">Avg. cost</div>\n             <div className="w-2/12 text-right py-2 pr-5">Cur. val</div>\n             <div className="w-2/12 text-right py-2 pl-5 border-l border-kite-vertical-divider">P&L</div>\n             <div className="w-1/12 text-right py-2">Net chg.</div>\n          </div>';

const hIdx = content.indexOf(headerStr);
if (hIdx === -1) {
    console.log("Failed to find header.");
    process.exit(1);
}

content = content.replace(headerStr, '');

const newCombinedSection = `<div className="md:sticky md:top-0 z-30 bg-kite-surface dark:bg-[#121212] shadow-sm w-full">
${actionBarText}
${headerStr}
</div>
`;

content = content.substring(0, sIdx) + newCombinedSection + content.substring(eIdx);

fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Success replacing investments!");
