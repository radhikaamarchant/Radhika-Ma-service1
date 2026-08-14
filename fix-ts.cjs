const fs = require('fs');

function fix(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // replace .forEach((node) => { with .forEach((node: any) => {
  code = code.replace(/\.forEach\(\(node\) => \{/g, '.forEach((node: any) => {');
  
  fs.writeFileSync(filePath, code);
}

fix('src/pages/Businesses.tsx');
fix('src/pages/Investors.tsx');
fix('src/pages/Investments.tsx');
fix('src/pages/DataAnalysis.tsx');
