const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Remove the old scroll logic useEffects
content = content.replace(/  const prevViewMode = useRef\(viewMode\);\n  const listScrollPos = useRef\(0\);\n\n  useEffect\(\(\) => \{[\s\S]*?  \}, \[viewMode\]\);\n\n  useLayoutEffect\(\(\) => \{[\s\S]*?  \}, \[viewMode\]\);\n/g, "");

content = content.replace(/  const prevViewMode = useRef\(viewMode\);\n  const listScrollPos = useRef\(0\);\n\n  useEffect\(\(\) => \{[\s\S]*?  \}, \[viewMode\]\);\n/g, "");

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Removed old scroll logic");
