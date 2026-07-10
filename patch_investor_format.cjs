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

if (!content.includes('formatCompactZerodha')) {
  content = content.replace(
    'export const BusinessDetail: React.FC<BusinessDetailProps> = ({',
    formatter + '\nexport const BusinessDetail: React.FC<BusinessDetailProps> = ({'
  );
}

const targetStr = `                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium \${isCompleted ? 'text-kite-blue' : 'text-kite-text'}\`}>{formatINR(inv.amount).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatINR(ownerProfit).replace("₹", "")}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">
                           {isCompleted ? "-" : \`\${liveProfit >= 0 ? "+" : "-"}\${formatINR(Math.abs(liveProfit)).replace("₹", "")}\`}
                         </td>`;

const newStr = `                     return (
                       <tr key={\`biz_inv_desk_\${inv.id}_\${idx}\`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className={\`py-4 px-4 text-right font-mono font-medium \${isCompleted ? 'text-kite-blue' : 'text-kite-text'}\`}>{formatCompactZerodha(inv.amount)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatCompactZerodha(ownerProfit)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">
                           {isCompleted ? "-" : \`\${liveProfit >= 0 ? "+" : ""}\${formatCompactZerodha(liveProfit)}\`}
                         </td>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/BusinessDetail.tsx', content);
  console.log("Patched number formatting in desktop table");
} else {
  console.log("Target string not found in BusinessDetail.tsx");
}
