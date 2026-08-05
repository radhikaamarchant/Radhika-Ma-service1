const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

// 1. Revert default page list container background
code = code.replace(
    '<div className="bg-white dark:bg-[#222222] border-y border-kite-border w-full">',
    '<div className="bg-white dark:bg-kite-surface border-y border-kite-border w-full">'
);

// 2. Add #BBBBBBD9 to default page text
code = code.replace(
    '<span className="font-medium text-kite-text text-[14px]">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</span>',
    '<span className="font-medium text-kite-text dark:text-[#BBBBBBD9] text-[14px]">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</span>'
);
code = code.replace(
    '<span className="font-medium text-[14px] text-kite-text">{uniqueInvestorCount} Investors</span>',
    '<span className="font-medium text-[14px] text-kite-text dark:text-[#BBBBBBD9]">{uniqueInvestorCount} Investors</span>'
);

// 3. Add #BBBBBBD9 to Investor Name in expanded list
code = code.replace(
    '<span className="text-[14px] font-medium text-kite-text truncate max-w-[200px]">{investor?.name || "Unknown"}</span>',
    '<span className="text-[14px] font-medium text-kite-text dark:text-[#BBBBBBD9] truncate max-w-[200px]">{investor?.name || "Unknown"}</span>'
);

// 4. Add #666666 to Qty in expanded list
code = code.replace(
    '<div className="flex-1 text-right text-[14px] text-kite-text">\n                            {totalQty}',
    '<div className="flex-1 text-right text-[14px] text-kite-text dark:text-[#666666]">\n                            {totalQty}'
);

// 5. Add #BBBBBBD9 to Equity Price in expanded list
code = code.replace(
    '<div className="flex-[1.5] text-right text-[14px] text-kite-text font-medium">\n                            {formatINR(data.totalAmount)}',
    '<div className="flex-[1.5] text-right text-[14px] text-kite-text dark:text-[#BBBBBBD9] font-medium">\n                            {formatINR(data.totalAmount)}'
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Patched colors");
