const fs = require('fs');
const content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const t1 = `            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1E2938]" style={{ paddingBottom: "200px" }}>
                {/* Main Inputs */}
                <div className="bg-white dark:bg-transparent relative">
                  {/* Business & Investor Select */}
                  <div className="flex flex-col">`;

const t2 = `                          )}
                     </div>
                  </div>
                   
                  {/* Amount and Quantity */}
                  <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-4">`;

console.log("t1 found:", content.includes(t1));
console.log("t2 found:", content.includes(t2));
