const fs = require('fs');
let code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');
code = code.replace(/useEffect\(\(\) => \{/g, `useEffect(() => {\n    console.log('AppContext mounted or remounted!');\n`);
fs.writeFileSync('src/utils/AppContext.tsx', code);
