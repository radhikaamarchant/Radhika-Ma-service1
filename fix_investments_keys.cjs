const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// Replace activeBusinesses map
content = content.replace(
  /\.map\(\(b\) => \(\s*<div\s*key={b\.id}/g,
  '.map((b, idx) => (\n                          <div\n                            key={`desk_biz_${b.id}_${idx}`}'
);

// Replace sortedInvestors map
content = content.replace(
  /\.map\(\(i\) => \(\s*<div\s*key={i\.id}/g,
  '.map((i, idx) => (\n                          <div\n                            key={`desk_inv_${i.id}_${idx}`}'
);

fs.writeFileSync('src/pages/Investments.tsx', content);
