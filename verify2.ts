import fs from 'fs';
const lines = fs.readFileSync('src/pages/Investors.tsx', 'utf8').split('\n');
const largeTexts = lines.filter(l => l.match(/text-(lg|xl|2xl|3xl|4xl|5xl|6xl)/));
console.log(largeTexts.join('\n'));
