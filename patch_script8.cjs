const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = '<div className="w-full space-y-6 hidden md:block relative min-h-screen">';
const replacement = '<div className="w-full space-y-6 hidden md:block relative">';

if (code.includes(targetStr)) {
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code.replace(targetStr, replacement));
    console.log("Patched container");
} else {
    console.log("Could not find target string");
}
