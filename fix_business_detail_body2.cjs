const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf-8');

content = content.replace(
  '  useEffect(() => {',
  `  useEffect(() => {
    document.body.classList.add('business-detail-open');
    return () => document.body.classList.remove('business-detail-open');
  }, []);\n\n  useEffect(() => {`
);

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Added body class to BusinessDetail correctly");
