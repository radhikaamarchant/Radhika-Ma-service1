const fs = require('fs');

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf-8');

content = content.replace(/filteredIpos\.map\(ipo => \{/g, 'filteredIpos.map((ipo, _idx) => {');

fs.writeFileSync('src/pages/Bids.tsx', content);

let invContent = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
// check if 'i' is defined in Investors.tsx for those maps.
// Let's just use the second parameter of the map.
// The map looks like `someArray.map(app => (` or `someArray.map((app) => (`
// Let's manually review them.
