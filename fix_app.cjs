const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
codeApp = codeApp.replace('pb-20 md:px-0', 'pb-24 md:px-0'); 
fs.writeFileSync('src/App.tsx', codeApp);
