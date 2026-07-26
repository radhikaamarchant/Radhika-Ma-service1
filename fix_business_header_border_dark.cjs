const fs = require('fs');
let cssContent = fs.readFileSync('src/index.css', 'utf-8');

cssContent = cssContent.replace(
  'html.dark body.business-detail-open .mobile-header-safe {\n  background-color: var(--kite-bg) !important;\n}',
  'html.dark body.business-detail-open .mobile-header-safe {\n  background-color: var(--kite-bg) !important;\n  border-bottom-color: var(--border-color-soft) !important;\n}'
);

fs.writeFileSync('src/index.css', cssContent);
console.log("Updated dark border color");
