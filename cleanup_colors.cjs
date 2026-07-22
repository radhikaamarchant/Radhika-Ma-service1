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
      
      newContent = newContent.replace(/text-\[#4CAF50\] dark:text-\[#5B9A5D\] dark:text-\[#5B9A5D\]/g, 'text-[#4CAF50] dark:text-[#5B9A5D]');
      newContent = newContent.replace(/text-\[#DF514C\] dark:text-\[#E25F5B\] dark:text-\[#E25F5B\]/g, 'text-[#DF514C] dark:text-[#E25F5B]');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

replaceColors('./src');
console.log("Cleanup done");
