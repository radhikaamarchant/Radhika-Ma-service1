const fs = require('fs');
const content = fs.readFileSync('src/pages/MyPnL.tsx', 'utf8');

// Find the return statement
const returnIndex = content.indexOf('return (');
console.log(returnIndex);
