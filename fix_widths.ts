import fs from 'fs';

let banking = fs.readFileSync('src/pages/Banking.tsx', 'utf8');
banking = banking.replace(/max-w-5xl/g, '');
fs.writeFileSync('src/pages/Banking.tsx', banking);

let investors = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
investors = investors.replace(/md:max-w-6xl/g, 'w-full');
fs.writeFileSync('src/pages/Investors.tsx', investors);
