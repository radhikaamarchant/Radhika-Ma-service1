const fs = require('fs');
const path = require('path');

const filePaths = [
  './src/pages/DataAnalysis.tsx',
  './src/pages/Investors.tsx',
  './src/pages/Businesses.tsx',
  './src/components/BusinessDetail.tsx'
];

filePaths.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    let newContent = content
      .replace(/className="text-blue-500"/g, 'className="text-white fill-blue-500"')
      .replace(/className="text-blue-500 fill-white"/g, 'className="text-white fill-blue-500"')
      .replace(/className="text-blue-500 flex-shrink-0"/g, 'className="text-white fill-blue-500 flex-shrink-0"');
      
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Fixed blue tick in', file);
    }
  }
});
