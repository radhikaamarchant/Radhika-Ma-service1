const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      // Replace text-green and text-kite-green
      newContent = newContent.replace(/\btext-green\b/g, 'text-[#4CAF50] dark:text-[#5B9A5D]');
      newContent = newContent.replace(/\btext-kite-green\b/g, 'text-[#4CAF50] dark:text-[#5B9A5D]');
      
      // Replace text-red and text-kite-red
      newContent = newContent.replace(/\btext-red\b/g, 'text-[#DF514C] dark:text-[#E25F5B]');
      newContent = newContent.replace(/\btext-kite-red\b/g, 'text-[#DF514C] dark:text-[#E25F5B]');

      // To handle if we accidentally created duplicates like "text-[#4CAF50] dark:text-[#5B9A5D] dark:text-[#5B9A5D]"
      newContent = newContent.replace(/text-\[#4CAF50\] dark:text-\[#5B9A5D\] dark:text-\[#5B9A5D\]/g, 'text-[#4CAF50] dark:text-[#5B9A5D]');
      newContent = newContent.replace(/text-\[#DF514C\] dark:text-\[#E25F5B\] dark:text-\[#E25F5B\]/g, 'text-[#DF514C] dark:text-[#E25F5B]');
      newContent = newContent.replace(/text-\[#4CAF50\] dark:text-\[#5B9A5D\] font-medium dark:text-\[#5B9A5D\]/g, 'text-[#4CAF50] dark:text-[#5B9A5D] font-medium');
      newContent = newContent.replace(/text-\[#DF514C\] dark:text-\[#E25F5B\] font-medium dark:text-\[#E25F5B\]/g, 'text-[#DF514C] dark:text-[#E25F5B] font-medium');

      // What if "dark:text-green" was there? Let's fix it if it became "dark:text-[#4CAF50] dark:text-[#5B9A5D]"
      newContent = newContent.replace(/dark:text-\[#4CAF50\] dark:text-\[#5B9A5D\]/g, 'dark:text-[#5B9A5D]');
      newContent = newContent.replace(/dark:text-\[#DF514C\] dark:text-\[#E25F5B\]/g, 'dark:text-[#E25F5B]');
      
      // Also handle text-green-500 etc. which might have been broken if we replaced text-green.
      // Wait, \b word boundary prevents text-green-500 from matching \btext-green\b
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

replaceColors('./src');
console.log("Done updating text colors");
