const fs = require('fs');
let original = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

let missing_body = fs.readFileSync('missing_body.txt', 'utf8');
// Clean up the start of missing_body.txt
missing_body = missing_body.replace(/^[\s\S]*?<div className="p-4 md:p-6 flex-1/m, '                {withdrawStep === 0 && (\n                <div className="hidden md:block p-4 md:p-6 flex-1');
missing_body = missing_body + '                </>\n                </div>\n                )}\n';

// Replace exact whitespace
original = original.replace(/<\/AnimatePresence>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\{withdrawStep === 1 && \(/, 
`</AnimatePresence>
                  </div>
                )}
              </div>
            </div>
${missing_body}
{withdrawStep === 1 && (`);

fs.writeFileSync('src/components/LivePortfolioDetail.tsx', original);
console.log("Patched successfully!");
