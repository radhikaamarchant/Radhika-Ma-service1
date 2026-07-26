const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Change the Mobile Holdings List Wrapper to transparent
content = content.replace(
  /<div className="block md:hidden pb-32 bg-white dark:bg-black">/,
  `<div className="block md:hidden pb-32 bg-transparent">`
);

// Change the Kite Style List from bg-transparent to bg-white
content = content.replace(
  /\{\/\* Kite Style List \*\/\}\s*<div className="bg-transparent">/,
  `{/* Kite Style List */}
                          <div className="bg-white dark:bg-black min-h-screen">`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated list bg.");
