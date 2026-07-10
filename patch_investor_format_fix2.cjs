const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const formatter = `
const formatCompactZerodha = (num: number) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum >= 10000000) {
    return (num / 10000000).toFixed(2).replace(/\\.00$/, '') + 'Cr';
  }
  if (absNum >= 100000) {
    return (num / 100000).toFixed(2).replace(/\\.00$/, '') + 'LK';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(2).replace(/\\.00$/, '') + 'K';
  }
  return num.toString();
};
`;

if (!content.includes('const formatCompactZerodha = (num: number)')) {
  content = content.replace(
    'export default function BusinessDetail({',
    formatter + '\nexport default function BusinessDetail({'
  );
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Injected formatCompactZerodha definition");
}
