import fs from 'fs';

function applyKiteClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip all the hardcoded dark classes we added
  content = content.replace(/ dark:bg-\[#\w+\]/g, '');
  content = content.replace(/ md:dark:bg-\[#\w+\]/g, '');
  content = content.replace(/ dark:text-\[#\w+\]/g, '');
  content = content.replace(/ dark:border-\w+\/\d+/g, '');
  content = content.replace(/ dark:border-\[#\w+\]/g, '');
  content = content.replace(/ dark:hover:bg-white\/\d+/g, '');
  content = content.replace(/ dark:hover:bg-\[#\w+\]/g, '');
  content = content.replace(/ dark:hover:text-\[#\w+\]/g, '');
  content = content.replace(/ dark:shadow-none/g, '');
  content = content.replace(/ dark:text-gray-\d+/g, '');
  content = content.replace(/ md:dark:bg-\w+/g, '');

  // Now replace standard hardcoded colors with kite classes
  content = content.replace(/text-\[#444444\]/g, 'text-kite-text');
  content = content.replace(/text-\[#9EA1A6\]/g, 'text-kite-text-light');
  
  // Backgrounds: 
  // Let bg-white just be bg-white (the index.css automatically makes it surface-color in dark mode)
  // Or explicitly use bg-white dark:bg-kite-surface
  content = content.replace(/bg-white(?! dark:)/g, 'bg-white dark:bg-kite-surface');
  
  // bg-[#F8F9FA] is light gray background
  content = content.replace(/bg-\[#F8F9FA\](?! dark:)/g, 'bg-[#F8F9FA] dark:bg-kite-bg');
  content = content.replace(/md:bg-\[#F8F9FA\](?! dark:)/g, 'md:bg-[#F8F9FA] md:dark:bg-kite-bg');

  // Borders
  content = content.replace(/border-gray-100/g, 'border-kite-border-soft');
  content = content.replace(/border-gray-200/g, 'border-kite-border');
  content = content.replace(/border-gray-300/g, 'border-kite-border');
  content = content.replace(/border-gray-50/g, 'border-kite-border-soft');
  
  // Avatar blue bg
  content = content.replace(/bg-\[#E8F0FE\]/g, 'bg-[#E8F0FE] dark:bg-kite-blue/20');
  content = content.replace(/text-\[#1976D2\]/g, 'text-[#1976D2] dark:text-[#64B5F6]'); // or text-kite-blue

  // Shadows
  content = content.replace(/shadow-\[0_2px_12px_rgba\(0,0,0,0\.06\)\]/g, 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none');

  // Text gray
  content = content.replace(/text-gray-500/g, 'text-kite-text-light');
  content = content.replace(/text-gray-600/g, 'text-kite-text');
  content = content.replace(/text-gray-400/g, 'text-kite-text-light');

  // Hover
  content = content.replace(/hover:bg-gray-50/g, 'hover:bg-gray-50 dark:hover:bg-kite-bg');
  content = content.replace(/hover:bg-gray-100/g, 'hover:bg-gray-100 dark:hover:bg-kite-border-soft');

  fs.writeFileSync(filePath, content);
}

applyKiteClasses('src/pages/AdminPage.tsx');
applyKiteClasses('src/components/Sidebar.tsx');
