const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/\.dark \.text-green \{ color: #53b987 !important; \}/g, '');
code = code.replace(/\.dark \.text-red \{ color: #eb5b3c !important; \}/g, '');

fs.writeFileSync('src/index.css', code);
