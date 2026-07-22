const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const lines = code.split('\n');

for (let i = 1520; i < 1700; i++) {
  if (lines[i] && lines[i].includes('className=') && lines[i].includes('text-[16px]') && lines[i].includes('w-full h-full')) {
    lines[i] = lines[i].replace('text-[16px]', 'text-[19px]');
  }
}

fs.writeFileSync('src/components/AddInvestmentModal.tsx', lines.join('\n'));
