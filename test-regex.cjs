const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');
let matches = code.match(/<input([^>]*?)>/g);
console.log(matches ? matches.length : 0);
if (matches) {
  let count = 0;
  for (let m of matches) {
    if (m.includes('setSearchTerm')) {
      console.log('Found setSearchTerm in match:', m);
      count++;
    }
  }
  console.log('Total setSearchTerm inputs:', count);
}
