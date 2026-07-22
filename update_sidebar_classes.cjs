const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

code = code.replace(
  /const upColorHex[\s\S]*const formatValue/m,
  `const getTrendColorClass = (flashState: "up" | "down" | null, isMarketOpen: boolean) => {
    if (isMarketOpen && flashState === "up") return "text-[#4CAF50] dark:text-[#5B9A5D]";
    if (isMarketOpen && flashState === "down") return "text-[#DF514C] dark:text-[#E25F5B]";
    return overallTrend > 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : overallTrend < 0 ? "text-[#DF514C] dark:text-[#E25F5B]" : "text-kite-text dark:text-[#e0e0e0]";
  };

  const trendColorClass = getTrendColorClass(flash, isOpen);

  const formatValue`
);

code = code.replace(
  /className="text-\[13px\] whitespace-nowrap overflow-hidden text-ellipsis uppercase"\s*style=\{\{ color: currentColorHex \}\}/g,
  'className={`text-[13px] whitespace-nowrap overflow-hidden text-ellipsis uppercase ${trendColorClass}`}'
);

code = code.replace(
  /className="text-right text-\[13px\] font-medium tabular-nums"\s*style=\{\{ color: currentColorHex \}\}/g,
  'className={`text-right text-[13px] font-medium tabular-nums ${trendColorClass}`}'
);

code = code.replace(
  /className="text-right text-\[12px\] tabular-nums" style=\{\{ color: absColorHex \}\}/g,
  'className="text-right text-[12px] tabular-nums text-[#9B9B9B] dark:text-[#666666]"'
);

code = code.replace(
  /className="text-right text-\[12px\] tabular-nums" style=\{\{ color: pctColorHex \}\}/g,
  'className="text-right text-[12px] tabular-nums text-[#444444D9] dark:text-[#BBBBBBD9]"'
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
