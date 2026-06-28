import fs from 'fs';

let investments = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
investments = investments.replace(/className="absolute bottom-0 left-0 w-full bg-white rounded-t-\[16px\]/g, 'className="absolute bottom-0 left-0 w-full bg-white dark:bg-kite-surface rounded-t-[16px]');
fs.writeFileSync('src/pages/Investments.tsx', investments);
