const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// 1. Remove the scroll logic completely.
const scrollLogicRegex = /const scrollPosRef = useRef<number>\(0\);[\s\S]*?mainRef\.current\.scrollTop = 0;\s*\}\s*\}/;
content = content.replace(scrollLogicRegex, "");
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Scroll logic removed.");
