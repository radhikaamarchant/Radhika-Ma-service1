const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

code = code.replace(
  /const formatValue = \(val: number\) => \{\s*if \(val > 0\) return `\$\{val\.toFixed\(2\)\}`;\s*if \(val < 0\) return `\$\{val\.toFixed\(2\)\}`;\s*return `0\.00`;\s*\};/,
  'const formatValue = (val: number) => {\n    return val.toFixed(2);\n  };'
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
