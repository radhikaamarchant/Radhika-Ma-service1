const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// remove font-mono from 1323
code = code.replace(
  'className="mt-2 text-[13px] text-kite-text-light font-mono bg-[#F8F9FA]',
  'className="mt-2 text-[13px] text-kite-text-light bg-[#F8F9FA]'
);

// remove font-mono from 1430, 1441
code = code.replace(
  /className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-\[15px\] font-mono text-kite-text focus:border-kite-blue transition-colors"/g,
  'className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] text-kite-text focus:border-kite-blue transition-colors"'
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
