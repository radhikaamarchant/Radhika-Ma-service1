const fs = require('fs');
let cssContent = fs.readFileSync('src/index.css', 'utf-8');

cssContent = cssContent.replace(
  'body.business-detail-open .mobile-header-safe {\n  background-color: #ffffff !important;\n}',
  'body.business-detail-open .mobile-header-safe {\n  background-color: #ffffff !important;\n  border-bottom-color: #E8EDF3 !important;\n}'
);

fs.writeFileSync('src/index.css', cssContent);
console.log("Updated border color");
