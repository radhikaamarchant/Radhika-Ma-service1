import fs from 'fs';
const lines = fs.readFileSync('src/pages/Investors.tsx', 'utf8').split('\n');
const classLines = lines.filter(l => l.includes('className=')).slice(0, 30);
console.log(classLines.join('\n'));
