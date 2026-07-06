const fs = require('fs');
let original = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

// Read missing body
let missing_body = fs.readFileSync('missing_body.txt', 'utf8');
// Clean up the start of missing_body.txt
missing_body = missing_body.replace(/^[\s\S]*?<div className="p-4 md:p-6 flex-1/m, '                {withdrawStep === 0 && (\n                <div className="hidden md:block p-4 md:p-6 flex-1');
missing_body = missing_body + '                </>\n                </div>\n                )}\n';

const targetStr = '</AnimatePresence>\n                  </div>\n                )}\n              </div>\n            </div>\n';

if (original.includes(targetStr)) {
  original = original.replace(targetStr, targetStr + missing_body);
  fs.writeFileSync('src/components/LivePortfolioDetail.tsx', original);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target string.");
  console.log(original.substring(original.indexOf('</AnimatePresence>')));
}
