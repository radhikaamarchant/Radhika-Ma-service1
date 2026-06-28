import fs from 'fs';
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Fix text-[#9EA1A6] to be more visible in dark mode
content = content.replace(/text-\[#9EA1A6\]/g, 'text-[#9EA1A6] dark:text-gray-400');

// Avatar background
content = content.replace(/bg-\[#E8F0FE\] text-\[#1976D2\]/g, 'bg-[#E8F0FE] dark:bg-[#1976D2]/20 text-[#1976D2] dark:text-[#64B5F6]');

// Ensure dark:text-[#E8E8E8] is used instead of standard gray or #444444
content = content.replace(/text-\[#444444\](?! dark:text)/g, 'text-[#444444] dark:text-[#E8E8E8]');

// text-gray-500 should be brighter in dark mode (gray-400 or gray-300)
// It was changed to dark:text-gray-400 earlier, let's verify if there are any stray text-gray-500
content = content.replace(/text-gray-500(?! dark:text)/g, 'text-gray-500 dark:text-gray-400');

// Check text-left on table
content = content.replace(/text-left text-\[13px\] md:text-\[14px\]/g, 'text-left text-[13px] md:text-[14px] text-[#444444] dark:text-[#E8E8E8]');

fs.writeFileSync('src/pages/AdminPage.tsx', content);
