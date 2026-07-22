const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Change in @theme block
code = code.replace('--color-kite-green: #16a34a;', '--color-kite-green: #4CAF50;');
code = code.replace('--color-kite-red: #df514c;', '--color-kite-red: #DF514C;');

fs.writeFileSync('src/index.css', code);
