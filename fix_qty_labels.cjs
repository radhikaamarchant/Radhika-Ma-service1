const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(/const qty = \(h\.invs as Investment\[\]\)\.reduce\(\(sum, inv\) => sum \+ \(inv\.quantity \|\| 1\), 0\);/g, 
`const qty = (h.invs as Investment[]).reduce((sum, inv) => {
                                if (inv.quantity) return sum + inv.quantity;
                                if (h.business && h.business.triggerAmount) {
                                  return sum + Math.floor(inv.amount / h.business.triggerAmount);
                                }
                                return sum + 1;
                              }, 0);`);

content = content.replace(/const qty = \(p\.invs as Investment\[\]\)\.reduce\(\(sum, inv\) => sum \+ \(inv\.quantity \|\| 1\), 0\);/g, 
`const qty = (p.invs as Investment[]).reduce((sum, inv) => {
                                if (inv.quantity) return sum + inv.quantity;
                                if (p.business && p.business.triggerAmount) {
                                  return sum + Math.floor(inv.amount / p.business.triggerAmount);
                                }
                                return sum + 1;
                              }, 0);`);

content = content.replace(/<th className="py-3 px-4 font-normal text-right">\s*P&L\s*<\/th>/, 
`<th className="py-3 px-4 font-normal text-right">
                              Total P&L (₹)
                            </th>`);

content = content.replace(/<th className="py-3 px-4 font-normal text-right">\s*% Chg\s*<\/th>/, 
`<th className="py-3 px-4 font-normal text-right">
                              Overall Return (%)
                            </th>`);

content = content.replace(/<p className="text-\[14px\] text-kite-text-light">\s*P&L\s*<\/p>/, 
`<p className="text-[14px] text-kite-text-light">
                                Total P&L (₹)
                              </p>`);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed qty and labels");
