const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = '<div className="bg-white dark:bg-[#222222] border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden w-full">';
const replacement = '<div className="bg-white dark:bg-[#222222] border-y border-kite-border w-full">';

if (code.includes(targetStr)) {
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(targetStr, replacement));
    console.log("Patched list container borders");
} else {
    console.log("Could not find target string");
}
