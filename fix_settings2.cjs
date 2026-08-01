const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

content = content.replace(/const updatedSettings, Percent =/g, 'const updatedSettings =');
content = content.replace(/payload: updatedSettings, Percent/g, 'payload: updatedSettings');

fs.writeFileSync('src/pages/AdminPage.tsx', content);
console.log("Fixed updatedSettings bug");
