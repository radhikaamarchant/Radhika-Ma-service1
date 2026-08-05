const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = '<div className="absolute inset-0 z-50 bg-white dark:bg-[#222222] animate-in slide-in-from-right-4 duration-300 rounded-lg shadow-xl border border-kite-border flex flex-col">';
const replacement = '<div className="bg-white dark:bg-[#222222] animate-in fade-in duration-300 rounded-sm shadow-xl border border-kite-border flex flex-col min-h-[60vh]">';

if (code.includes(targetStr)) {
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(targetStr, replacement));
    console.log("Patched absolute positioned div");
} else {
    console.log("Could not find target string");
}
