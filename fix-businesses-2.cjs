const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// The line is:
// {filteredBusinesses.length === 0 && (
//   <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">
//     No businesses found.
//   </div>
// )}
code = code.replace(
  /\{filteredBusinesses\.length === 0 && \([\s\S]*?No businesses found\.[\s\S]*?\}\)/,
  `<div id="no-businesses-found" style={{ display: 'none' }} className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">No businesses found.</div>`
);

fs.writeFileSync('src/pages/Businesses.tsx', code);
