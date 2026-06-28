import fs from 'fs';

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Businesses.tsx',
  'src/pages/DataAnalysis.tsx',
  'src/pages/Investments.tsx',
  'src/pages/Investors.tsx',
  'src/pages/MyPnL.tsx',
  'src/pages/AdminPage.tsx',
  'src/pages/Banking.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/max-w-[34567]xl mx-auto/g, 'w-full');
    fs.writeFileSync(file, content);
  }
}
