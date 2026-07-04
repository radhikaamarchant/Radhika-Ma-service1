import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /w-\[300px\] lg:w-\[610px\] max-w-\[45vw\] border-r border-kite-border z-\[100\] sidebar-container/g,
  `w-[320px] lg:w-[410px] max-w-[45vw] border-r border-kite-border z-[100] sidebar-container`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Success Sidebar Patch 410");
