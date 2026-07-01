const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// Fix holdings maps
content = content.replace(
  /holdings\.map\(\(h, i\) => {(\s*.*?\s*.*?\s*.*?\s*.*?\s*return \(\s*<tr\s*key={i})/g,
  'holdings.map((h, i) => {$1_biz_${h.bizId}`}'
);

content = content.replace(
  /holdings\.map\(\(h, i\) => {(\s*.*?\s*.*?\s*.*?\s*.*?\s*.*?\s*return \(\s*<div\s*key={i})/g,
  'holdings.map((h, i) => {$1_biz_mob_${h.bizId}`}'
);

content = content.replace(
  /positions\.map\(\(p, i\) => {(\s*.*?\s*.*?\s*.*?\s*.*?\s*return \(\s*<tr\s*key={i})/g,
  'positions.map((p, i) => {$1_pos_biz_${p.bizId}`}'
);

content = content.replace(
  /positions\.map\(\(p, i\) => {(\s*.*?\s*.*?\s*.*?\s*.*?\s*.*?\s*return \(\s*<div\s*key={i})/g,
  'positions.map((p, i) => {$1_pos_biz_mob_${p.bizId}`}'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
