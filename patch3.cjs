const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

code = code.replace(
  'const upColorHex = isDark ? "#4CAF50" : "#4CAF50";',
  'const upColorHex = isDark ? "#5B9A5D" : "#4CAF50";'
);
code = code.replace(
  'const downColorHex = isDark ? "#DF514C" : "#DF514C";',
  'const downColorHex = isDark ? "#E25F5B" : "#DF514C";'
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
