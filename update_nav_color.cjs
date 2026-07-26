const fs = require('fs');
let content = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf-8');
content = content.replace(/#9B9B9B/g, '#fafafa');
fs.writeFileSync('src/components/MobileBottomNav.tsx', content);
console.log("Updated nav colors");
