const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const regex = /<div className="flex-1 overflow-y-auto bg-white dark:bg-\[#1E2938\]" style={{ paddingBottom: "200px" }}>\s*{\/\* Main Inputs \*\/}\s*<div className="bg-white dark:bg-transparent relative">\s*{\/\* Business & Investor Select \*\/}\s*<div className="flex flex-col">([\s\S]*?)<\/div>\s*<\!-- this is the end of the flex flex-col for Business & Investor Select -->/;

// Actually, regex might be tricky. Let's just find the start and end string manually.
