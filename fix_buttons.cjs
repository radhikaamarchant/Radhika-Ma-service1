const fs = require('fs');

const files = [
  'src/pages/Businesses.tsx',
  'src/pages/Investors.tsx',
  'src/pages/Investments.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix py-4 buttons to be medium sized
  content = content.replace(/py-4 rounded text-sm md:text-base/g, 'py-3 md:py-3.5 rounded text-[13px] md:text-sm');
  content = content.replace(/h-\[56px\]/g, 'h-[44px] md:h-[48px]');

  fs.writeFileSync(file, content);
}
console.log('Fixed buttons');
