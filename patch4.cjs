const fs = require('fs');
let code = fs.readFileSync('src/user-dark-theme.css', 'utf8');

code = code.replace(/#DF514C/g, '#E25F5B');
code = code.replace(/#4CAF50/g, '#5B9A5D');

fs.writeFileSync('src/user-dark-theme.css', code);
