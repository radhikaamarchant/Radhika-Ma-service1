import fs from 'fs';

let text = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

text = text.replace(/bg-white min-h-screen/g, 'bg-white dark:bg-transparent min-h-screen');
text = text.replace(/className={`flex flex-col w-full bg-white pt-2 border-b border-gray-100/g, 'className={`flex flex-col w-full bg-white dark:bg-transparent pt-2 border-b border-kite-border');
text = text.replace(/bg-white md:bg-transparent/g, 'bg-white dark:bg-kite-surface md:bg-transparent');
text = text.replace(/md:max-w-\[500px\] bg-white shadow-2xl/g, 'md:max-w-[500px] bg-white dark:bg-kite-surface shadow-2xl');
text = text.replace(/h-\[60px\] bg-white border-b border-kite-border/g, 'h-[60px] bg-white dark:bg-kite-surface border-b border-kite-border');
text = text.replace(/w-full bg-white border-y/g, 'w-full bg-white dark:bg-transparent border-y');
text = text.replace(/w-\[100px\] bg-white shadow-\[0_4px_12px_rgba\(0,0,0,0\.08\)\]/g, 'w-[100px] bg-white dark:bg-kite-surface shadow-[0_4px_12px_rgba(0,0,0,0.08)]');
text = text.replace(/z-50 bg-white shadow-lg/g, 'z-50 bg-white dark:bg-kite-surface shadow-lg');

fs.writeFileSync('src/pages/Investments.tsx', text);
