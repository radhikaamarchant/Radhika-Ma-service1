const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// Header
content = content.replace(
  /<div className="w-\[28%\] text-left py-2 text-\[12px\] text-kite-text-muted">OWNER NAME<\/div>/g,
  '<div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>'
);
content = content.replace(
  /<div className="w-\[14%\] text-left py-2 text-\[12px\] text-kite-text-muted">ID<\/div>/g,
  '<div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>'
);
content = content.replace(
  /<div className="w-\[14%\] text-right py-2 text-\[12px\] text-kite-text-muted pr-5">ROI<\/div>/g,
  '<div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>'
);

// Row
content = content.replace(
  /<div className="w-\[28%\] text-left py-3 text-\[13px\] text-kite-text-light truncate pr-2">/g,
  '<div className="w-[28%] text-left py-3 text-[13px] text-kite-text-light truncate pl-4 border-l border-kite-vertical-divider">'
);
content = content.replace(
  /<div className="w-\[14%\] text-left py-3 text-\[12px\] text-kite-text-light font-mono truncate pr-2">/g,
  '<div className="w-[14%] text-left py-3 text-[12px] text-kite-text-light font-mono truncate pl-4 border-l border-kite-vertical-divider">'
);
content = content.replace(
  /<div className="w-\[14%\] text-right py-3 text-\[13px\] text-kite-green pr-5 truncate">/g,
  '<div className="w-[14%] text-right py-3 text-[13px] text-kite-green pr-4 border-l border-kite-vertical-divider truncate">'
);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched Businesses");
