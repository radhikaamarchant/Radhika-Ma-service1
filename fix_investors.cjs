const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  /holdings\.map\(\(h, i\) => {\s*const qty = \(h.invs as Investment\[\]\).length;\s*const avgPrice = h.investedAmount \/ qty;\s*const ltp = h.currentValue \/ qty;\s*const pnlPercent = h.investedAmount > 0 \? \(h.liveProfit \/ h.investedAmount\) \* 100 : 0;\s*return \(\s*<tr\s*key={i}/g,
  `holdings.map((h, i) => {
                            const qty = (h.invs as Investment[]).length;
                            const avgPrice = h.investedAmount / qty;
                            const ltp = h.currentValue / qty;
                            const pnlPercent = h.investedAmount > 0 ? (h.liveProfit / h.investedAmount) * 100 : 0;
                            
                            return (
                              <tr
                                key={\`desk_inv_h_\${h.bizId}_\${i}\`}`
);

content = content.replace(
  /holdings\.map\(\(h, i\) => {\s*const qty = \(h.invs as Investment\[\]\).length;\s*const avgPrice = h.investedAmount \/ qty;\s*const ltp = h.currentValue \/ qty;\s*const pnlPercent = h.investedAmount > 0 \? \(h.liveProfit \/ h.investedAmount\) \* 100 : 0;\s*return \(\s*<div \s*key={i}/g,
  `holdings.map((h, i) => {
                              const qty = (h.invs as Investment[]).length;
                              const avgPrice = h.investedAmount / qty;
                              const ltp = h.currentValue / qty;
                              const pnlPercent = h.investedAmount > 0 ? (h.liveProfit / h.investedAmount) * 100 : 0;
                              
                              return (
                                <div 
                                  key={\`mob_inv_h_\${h.bizId}_\${i}\`}`
);


content = content.replace(
  /positions\.map\(\(p, i\) => {\s*const qty = \(p.invs as Investment\[\]\).length;\s*const avgPrice = p.investedAmount \/ qty;\s*return \(\s*<tr\s*key={i}/g,
  `positions.map((p, i) => {
                            const qty = (p.invs as Investment[]).length;
                            const avgPrice = p.investedAmount / qty;
                            return (
                              <tr
                                key={\`desk_inv_p_\${p.bizId}_\${i}\`}`
);

content = content.replace(
  /positions\.map\(\(p, i\) => {\s*const qty = \(p.invs as Investment\[\]\).length;\s*const avgPrice = p.investedAmount \/ qty;\s*return \(\s*<div \s*key={i}/g,
  `positions.map((p, i) => {
                            const qty = (p.invs as Investment[]).length;
                            const avgPrice = p.investedAmount / qty;
                            
                            return (
                              <div 
                                key={\`mob_inv_p_\${p.bizId}_\${i}\`}`
);

content = content.replace(
  /\.map\(\(inv, i\) => {\s*const business = state\.businesses\.find\(\s*\(b\) => b\.id === inv\.businessId,\s*\);\s*const payout = inv\.payoutDetails;\s*return \(\s*<div\s*key={i}/g,
  `.map((inv, i) => {
                  const business = state.businesses.find(
                    (b) => b.id === inv.businessId,
                  );
                  const payout = inv.payoutDetails;
                  return (
                    <div
                      key={\`inv_pos_\${inv.id}_\${i}\`}`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
