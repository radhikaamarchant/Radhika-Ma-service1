import * as fs from 'fs';

let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const target = `<h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider hidden md:block">Available Investor</h3>`;
const replacement = `<h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider">Available Investor</h3>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/BusinessDetail.tsx', content, 'utf8');
console.log('Fixed mobile title!');
