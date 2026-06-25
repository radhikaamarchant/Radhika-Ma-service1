const fs = require('fs');

const files = [
  'src/pages/Businesses.tsx',
  'src/pages/Investors.tsx',
  'src/pages/Investments.tsx',
  'src/pages/DataAnalysis.tsx',
  'src/pages/Dashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix oversized mobile headings to be compact
  content = content.replace(/text-xl md:text-base/g, 'text-[15px] md:text-xl');
  content = content.replace(/text-xl md:text-2xl/g, 'text-lg md:text-xl');
  content = content.replace(/text-xs md:text-base font-medium/g, 'text-[15px] md:text-xl font-medium');

  fs.writeFileSync(file, content);
}
console.log('Fixed headings');
