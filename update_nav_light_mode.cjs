const fs = require('fs');
let content = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf-8');
content = content.replace(/text-\[#fafafa\] dark:text-\[#fafafa\]/g, 'text-[#2e2e34] dark:text-[#fafafa]');
content = content.replace(/hover:text-\[#fafafa\] dark:hover:text-\[#fafafa\]/g, 'hover:text-[#2e2e34] dark:hover:text-[#fafafa]');
fs.writeFileSync('src/components/MobileBottomNav.tsx', content);
console.log("Updated nav light mode colors");
