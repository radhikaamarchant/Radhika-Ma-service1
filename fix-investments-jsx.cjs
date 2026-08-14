const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// I replaced this:
// <div id="no-investments-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No investments found.</div>
//               </p>
//               {""}
//             </div>
//           }
//           {""}
//         </div>

// The original `groupedInvestments.length === 0` had a full `<div> <p>No investments found.</p> </div>` block.

code = code.replace(
  /<div id="no-investments-found" style=\{\{ display: 'none' \}\} className="p-8 text-center text-kite-text-light font-normal text-\[13px\] md:text-\[14px\]">No investments found\.<\/div>\n              <\/p>\n              \{""\}\n            <\/div>\n          \}/,
  `<div id="no-investments-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No investments found.</div>`
);

fs.writeFileSync('src/pages/Investments.tsx', code);
