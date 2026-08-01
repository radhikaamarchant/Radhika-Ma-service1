const fs = require('fs');
let content = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

const regex = /try\s*\{\s*const bidsComms = JSON\.parse.*?catch\(e\)\s*\{\}/gs;
let matches = [...content.matchAll(regex)];
console.log(`Found ${matches.length} try-catch blocks for bids_commissions`);

