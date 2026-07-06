const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

// Change EXIT to SELL
content = content.replace(
  />\s*EXIT\s*<\/button>/g,
  '>\n                      SELL\n                    </button>'
);

// We need to restore `hidden md:block` around the main body if withdrawStep === 0
// Wait, if I do that, the SELL details will still show on desktop when withdrawStep === 1 because the wrapper will be removed and it will show on all devices.
// But we DO want the main body to show on mobile when withdrawStep === 1!
// Wait! If withdrawStep === 1, we want the main body to show on mobile?
// Yes, so they can see the SELL DETAILS on mobile too!
// So the wrapper for the main body should be: className={`p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg ${withdrawStep === 0 ? "hidden md:block" : ""}`}

content = content.replace(
  '<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">',
  '<div className={`p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg ${withdrawStep === 0 ? "hidden md:block" : ""}`}>'
);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Patched LivePortfolioDetail.tsx");
