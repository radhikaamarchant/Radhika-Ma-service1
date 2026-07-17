const fs = require('fs');
const code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const match = code.match(/\{business\.triggerAmount \? formatINR\(business\.triggerAmount\) : '-'\}/g);
console.log(match);
