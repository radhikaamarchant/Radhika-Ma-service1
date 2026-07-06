const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

content = content.replace(
  '<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">',
  '<div className={`p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg ${withdrawStep === 0 ? "hidden md:block" : ""}`}>'
);

fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Patched Investments.tsx");
