const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

if (!code.includes('useDeferredValue')) {
    code = code.replace('useMemo } from "react";', 'useMemo, useDeferredValue } from "react";');
}

fs.writeFileSync('src/pages/Investors.tsx', code);
