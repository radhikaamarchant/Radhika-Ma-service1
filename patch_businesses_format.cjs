const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const formatLargeFn = `
const formatLargeNumber = (num) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  let formatted = '';
  if (absNum >= 10000000) {
    formatted = (absNum / 10000000).toFixed(2).replace(/\\.00$/, '') + ' CR';
  } else if (absNum >= 100000) {
    formatted = (absNum / 100000).toFixed(2).replace(/\\.00$/, '') + ' LK';
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(2).replace(/\\.00$/, '') + ' K';
  } else {
    formatted = absNum.toFixed(2).replace(/\\.00$/, '');
  }
  return (num < 0 ? "-" : "") + formatted;
};
`;

if (!content.includes('formatLargeNumber')) {
  content = content.replace('export default function Businesses() {', formatLargeFn + '\nexport default function Businesses() {');
}

// Replace formatINR(totalInvested) with \`₹\${formatLargeNumber(totalInvested)}\` in the Desktop view only.
// Wait, the desktop view had formatINR(totalInvested) on line 400ish
content = content.replace(
  /<div className="w-\[14%\] text-right py-3 text-\[13px\] font-normal text-kite-text pl-5 border-l border-kite-vertical-divider truncate">\s*\{formatINR\(totalInvested\)\}\s*<\/div>/,
  '<div className="w-[14%] text-right py-3 text-[13px] font-normal text-kite-text pl-5 border-l border-kite-vertical-divider truncate">\n                            {`₹${formatLargeNumber(totalInvested)}`}\n                          </div>'
);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched Businesses format");
