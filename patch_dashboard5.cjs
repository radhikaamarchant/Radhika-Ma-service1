const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Constrain Inv Impect (%)
const oldInvImpact = 'const invImpact = Math.max(0, baseImpact + invImpactFluctuation);';
const newInvImpact = 'const invImpact = Math.max(1, Math.min(100, baseImpact + invImpactFluctuation));';
code = code.replace(oldInvImpact, newInvImpact);

// 2. Rename Option Chain to Liqudity Price(₹)
// In the desktop section:
const oldSectionHeader = '<h2 className="text-[13px] font-medium text-kite-text uppercase tracking-wider">Option Chain</h2>';
const newSectionHeader = '<h2 className="text-[13px] font-medium text-kite-text uppercase tracking-wider">Liqudity Price(₹)</h2>';
code = code.replace(oldSectionHeader, newSectionHeader);

// 3. Rename CALLS and PUTS
const oldCalls = '<th colSpan={4} className="py-2 px-2 text-center border-r border-kite-border/50">CALLS</th>';
const newCalls = '<th colSpan={4} className="py-2 px-2 text-center border-r border-kite-border/50">Expect price (₹)</th>';
code = code.replace(oldCalls, newCalls);

const oldPuts = '<th colSpan={4} className="py-2 px-2 text-center">PUTS</th>';
const newPuts = '<th colSpan={4} className="py-2 px-2 text-center">Genetic Price(₹)</th>';
code = code.replace(oldPuts, newPuts);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Dashboard.tsx patched successfully!");
