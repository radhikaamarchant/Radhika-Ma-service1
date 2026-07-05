const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

const formatLargeFn = `
const formatLargeNumber = (num: number) => {
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
  content = content.replace('const LiveSidebarValue', formatLargeFn + '\nconst LiveSidebarValue');
}

content = content.replace(
  /\{currentAmount\.toLocaleString\("en-IN", \{ maximumFractionDigits: 0 \}\)\}/,
  '{formatLargeNumber(currentAmount)}'
);

content = content.replace(
  /className="grid grid-cols-\[1fr_75px_115px\] lg:grid-cols-\[1fr_80px_140px\] gap-2 items-center w-full"/,
  'className="grid grid-cols-[1fr_65px_80px] lg:grid-cols-[1fr_75px_90px] gap-2 items-center w-full"'
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', content);
console.log("Patched BusinessSidebar format");
