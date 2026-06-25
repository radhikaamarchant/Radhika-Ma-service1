const fs = require('fs');

const files = ['src/pages/Dashboard.tsx', 'src/pages/DataAnalysis.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace avatar background and fonts
  content = content.replace(
    /bg-\[#387ed1\] text-white flex-shrink-0 font-bold flex items-center justify-center font-medium/g,
    'bg-gradient-to-br from-[#387ed1] to-[#2563eb] shadow-sm text-white flex-shrink-0 font-sans font-bold flex items-center justify-center'
  );

  fs.writeFileSync(file, content);
}
console.log('Fixed avatars');
