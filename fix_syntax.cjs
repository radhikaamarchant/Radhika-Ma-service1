const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

content = content.replace(`{/* DESKTOP HEADER (Moved to be sticky together) */}`, `</div></div>{" "}{/* DESKTOP HEADER (Moved to be sticky together) */}`);

fs.writeFileSync('src/pages/Businesses.tsx', content);
