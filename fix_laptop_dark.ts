import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// The main page container
content = content.replace(/md:dark:bg-\[#141414\]/g, 'md:dark:bg-[#121212]');

// The inner max-w-2xl container needs the md dark background too
content = content.replace(/bg-\[#F8F9FA\] dark:bg-\[#131722\] md:border-x/g, 'bg-[#F8F9FA] dark:bg-[#131722] md:dark:bg-[#121212] md:border-x');

// Update md:dark:bg-[#191919] to a slightly lighter box color like #1e1e1e
content = content.replace(/md:dark:bg-\[#191919\]/g, 'md:dark:bg-[#1E1E1E]');

// Width adjustments for laptop
content = content.replace(/max-w-2xl/g, 'max-w-5xl');
content = content.replace(/max-w-xl/g, 'max-w-5xl'); // this is for the popup

// Fix invisible fonts in dark mode
content = content.replace(/dark:text-gray-500/g, 'dark:text-gray-400');

// Account name bold
content = content.replace(/h2 className="text-\[16px\] md:text-\[18px\] font-normal text-\[#444444\] dark:text-\[#E8E8E8\] uppercase tracking-wide"/g, 'h2 className="text-[16px] md:text-[18px] font-bold text-[#444444] dark:text-[#E8E8E8] uppercase tracking-wide"');

// Fix border colors for dark mode to be less harsh
content = content.replace(/dark:border-white\/10/g, 'dark:border-white/5');

fs.writeFileSync('src/pages/AdminPage.tsx', content);
