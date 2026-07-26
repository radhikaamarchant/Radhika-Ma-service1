const fs = require('fs');
let content = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf-8');

const oldBtn = `className={\`flex-1 py-2 flex flex-col items-center justify-center space-y-1 \${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white hover:text-[#4A4A4A] dark:hover:text-white"}\`}`;
const newBtn = `className={\`flex-1 h-full flex flex-col items-center justify-center gap-1 \${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B] hover:text-[#9B9B9B] dark:hover:text-[#9B9B9B]"}\`}`;

const oldIcon = `className={\`w-[22px] h-[22px] \${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white"}\`}`;
const newIcon = `className={\`w-[20px] h-[20px] \${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B]"}\`}`;

const oldSpan = `className={\`text-[10px] md:text-[11px] font-medium tracking-wide \${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white"}\`}`;
const newSpan = `className={\`text-[10px] font-medium tracking-wide \${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B]"}\`}`;

content = content.replace(oldBtn, newBtn).replace(oldIcon, newIcon).replace(oldSpan, newSpan);

fs.writeFileSync('src/components/MobileBottomNav.tsx', content);
console.log("Fixed mobile bottom nav");
