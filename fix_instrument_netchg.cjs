const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// Replace Overall Return (%) with Net Chg.
content = content.replace(
  /<th className="py-3 px-4 font-normal text-right">\s*Overall Return \(%\)\s*<\/th>/,
  `<th className="py-3 px-4 font-normal text-right">
                              Net Chg.
                            </th>`
);

// Replace business names in desktop and mobile views for holdings
content = content.replace(
  /\{h\.business\?\.name\?\.toUpperCase\(\) \|\|/g,
  `{(h.business?.shortName || h.business?.name)?.toUpperCase() ||`
);

// Replace business names in desktop and mobile views for positions
content = content.replace(
  /\{p\.business\?\.name\?\.toUpperCase\(\) \|\|/g,
  `{(p.business?.shortName || p.business?.name)?.toUpperCase() ||`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Changes applied!");
