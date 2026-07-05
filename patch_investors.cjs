const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

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
  content = content.replace('export default function Investors() {', formatLargeFn + '\nexport default function Investors() {');
}

const mapStartIdx = content.indexOf('{filteredInvestors.map((investor, idx) => {');
const endMapIdx = content.indexOf('})}{" "}', mapStartIdx);

if (mapStartIdx === -1 || endMapIdx === -1) {
  console.log("Could not find map block.");
  process.exit(1);
}

const beforeMap = content.substring(content.lastIndexOf('<div className="flex flex-col divide-y divide-kite-border border-b border-kite-border">', mapStartIdx), mapStartIdx);
const innerMap = content.substring(mapStartIdx + '{filteredInvestors.map((investor, idx) => {'.length, endMapIdx);

const returnStartIdx = innerMap.indexOf('return (');
const logicPart = innerMap.substring(0, returnStartIdx);
const jsxPart = innerMap.substring(returnStartIdx + 'return ('.length, innerMap.lastIndexOf(');'));

const mobileInnerMatch = jsxPart.match(/<div\s+key=\{`inv_\$\{investor\.id\}_\$\{idx\}`\}[\s\S]*?>([\s\S]*?)$/m);
// actually easier:
const jsxFirstDivMatch = jsxPart.match(/<div\s+key=\{`inv_\$\{investor\.id\}_\$\{idx\}`\}[\s\S]*?onClick=\{\(\) => \{\s*setSelectedInvestor\(investor\);\s*setViewMode\("investor-detail"\);\s*\}\}[\s\S]*?className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-kite-bg hover:bg-gray-50 dark:hover:bg-kite-border-soft cursor-pointer transition-colors min-h-\[50px\] md:min-h-\[60px\] group"\s*>([\s\S]*)/);
const mobileInner = jsxFirstDivMatch[1]; // wait, there is a closing </div> we should exclude

const replacement = `<div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">
                  {/* DESKTOP HEADER */}
                  <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border">
                    <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">INVESTOR NAME</div>
                    <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                    <div className="w-[18%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">INVEST AMOUNT</div>
                    <div className="w-[16%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">PERCENTAGE</div>
                    <div className="w-[22%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-5">TOTAL PROFIT</div>
                  </div>
                  {filteredInvestors.map((investor, idx) => {${logicPart}return (
                      <div
                        key={\`inv_\${investor.id}_\${idx}\`}
                        onClick={() => {
                          setSelectedInvestor(investor);
                          setViewMode("investor-detail");
                        }}
                        className="flex flex-col bg-white dark:bg-kite-bg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors min-h-[50px] group"
                      >
                        {/* Mobile View */}
                        <div className="flex md:hidden items-center justify-between p-3 border-b border-kite-border">${mobileInner}</div>
                        {/* Desktop View */}
                        <div className="hidden md:flex items-center w-full px-4 border-b border-kite-border">
                          <div className="w-[30%] text-left py-3 flex items-center overflow-hidden pr-2">
                            <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                              {investor.name?.toUpperCase()}
                            </span>
                            {investor.id === "admin_investor" && (
                              <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0 ml-1.5" />
                            )}
                          </div>
                          <div className="w-[14%] text-left py-3 text-[12px] text-kite-text-light font-mono truncate pl-4 border-l border-kite-vertical-divider">
                            {investor.investorId}
                          </div>
                          <div className="w-[18%] text-right py-3 text-[13px] font-normal text-kite-text pr-4 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? \`₹\${formatLargeNumber(totalAmountInvested)}\` : "NOT INVESTED"}
                          </div>
                          <div className="w-[16%] text-right py-3 text-[13px] pr-4 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? (
                              <span className={returnPercentage >= 0 ? "text-kite-green" : "text-kite-red"}>
                                {returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-kite-text-light">-</span>
                            )}
                          </div>
                          <div className="w-[22%] text-right py-3 text-[13px] font-normal pl-5 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? (
                               <span className={totalLiveProfit >= 0 ? "text-kite-green" : "text-kite-red"}>
                                  {totalLiveProfit >= 0 ? "+" : ""}\`₹\${formatLargeNumber(totalLiveProfit)}\`
                               </span>
                            ) : (
                              <span className="text-kite-text-light">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );`;

const fullOriginalBlock = content.substring(
  content.lastIndexOf('<div className="flex flex-col divide-y divide-kite-border border-b border-kite-border">', mapStartIdx),
  endMapIdx
);

content = content.replace(fullOriginalBlock, replacement);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched list");
