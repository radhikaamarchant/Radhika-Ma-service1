const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

code = code.replace(/dark:md:/g, "md:dark:");

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
