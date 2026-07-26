const fs = require('fs');

let content = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf-8');

const target = `const LiveSidebarValue = React.memo(({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {
  const { isDark } = useTheme();
  const displayBase = baseAmount || 10000;
  const [currentAmount, setCurrentAmount] = useState(displayBase);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setFlash(null);
      setCurrentAmount(displayBase);
      return;
    }
    let current = displayBase;
    const interval = setInterval(() => {
      const change = current * (Math.random() * 0.002 - 0.001); // +/- 0.1% change
      const newAmount = current + change;
      
      setCurrentAmount(newAmount);
      
      if (newAmount > current) setFlash("up");
      else if (newAmount < current) setFlash("down");
      
      current = newAmount;
      
      setTimeout(() => setFlash(null), 300);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [baseAmount, isOpen]);

  // Use the actual overall trend instead of the random fluctuation for percentage
  const isPositive = overallTrend > 0;
  const isNegative = overallTrend < 0;

  const absoluteChange = displayBase - (displayBase / (1 + (overallTrend / 100)));
  
  const getTrendColorClass = (flashState: "up" | "down" | null, isMarketOpen: boolean) => {
    if (isMarketOpen && flashState === "up") return "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] md:dark:text-[#5B9A5D]";
    if (isMarketOpen && flashState === "down") return "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] md:dark:text-[#E25F5B]";
    return overallTrend > 0 
      ? "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] md:dark:text-[#5B9A5D]" 
      : overallTrend < 0 
        ? "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] md:dark:text-[#E25F5B]" 
        : "text-kite-text dark:text-[#e0e0e0] md:text-[#9B9B9B] md:dark:text-[#666666]"; // default neutral
  };

  const trendColorClass = getTrendColorClass(flash, isOpen);

  const formatValue = (val: number) => {
    return val.toFixed(2);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_55px_60px_65px] gap-x-[8px] items-center w-full">
      <span 
        className={\`text-[13px] md:text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis uppercase \${trendColorClass}\`}
      >
        {name}
      </span>
      <span className="text-right text-[13px] md:text-[13px] font-medium text-[#9B9B9B] dark:text-[#666666] md:text-[#9B9B9B] md:dark:text-[#666666]">
        {formatValue(absoluteChange)}
      </span>
      <span className="text-right text-[13px] md:text-[13px] font-medium text-[#444444D9] dark:text-[#BBBBBBD9] md:text-[#444444D9] md:dark:text-[#BBBBBBD9]">
        {formatValue(overallTrend)}%
      </span>
      <span 
        className={\`text-right text-[13px] md:text-[13px] font-medium tabular-nums \${trendColorClass}\`}
      >
        {formatPrice(currentAmount)}
      </span>
    </div>
  );
});`;

const replacement = `const LiveSidebarValue = React.memo(({ name, originalPrice, baseAmount, isOpen }: { name: string; originalPrice: number; baseAmount: number; isOpen: boolean }) => {
  const { isDark } = useTheme();
  const displayBase = baseAmount || 10000;
  const [currentAmount, setCurrentAmount] = useState(displayBase);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setFlash(null);
      setCurrentAmount(displayBase);
      return;
    }
    let current = displayBase;
    const interval = setInterval(() => {
      const change = current * (Math.random() * 0.002 - 0.001); // +/- 0.1% change
      const newAmount = current + change;
      
      setCurrentAmount(newAmount);
      
      if (newAmount > current) setFlash("up");
      else if (newAmount < current) setFlash("down");
      
      current = newAmount;
      
      setTimeout(() => setFlash(null), 300);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [baseAmount, isOpen]);

  const absoluteChange = currentAmount - originalPrice;
  const percentageChange = originalPrice > 0 ? (absoluteChange / originalPrice) * 100 : 0;
  
  const getTrendColorClass = (flashState: "up" | "down" | null, isMarketOpen: boolean) => {
    if (isMarketOpen && flashState === "up") return "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] md:dark:text-[#5B9A5D]";
    if (isMarketOpen && flashState === "down") return "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] md:dark:text-[#E25F5B]";
    return percentageChange > 0 
      ? "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] md:dark:text-[#5B9A5D]" 
      : percentageChange < 0 
        ? "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] md:dark:text-[#E25F5B]" 
        : "text-kite-text dark:text-[#e0e0e0] md:text-[#9B9B9B] md:dark:text-[#666666]"; // default neutral
  };

  const trendColorClass = getTrendColorClass(flash, isOpen);

  const formatValue = (val: number) => {
    return val > 0 ? \`+\${val.toFixed(2)}\` : val.toFixed(2);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_55px_60px_65px] gap-x-[8px] items-center w-full">
      <span 
        className={\`text-[13px] md:text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis uppercase \${trendColorClass}\`}
      >
        {name}
      </span>
      <span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : percentageChange > 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#9B9B9B] dark:text-[#666666]'}\`}>
        {formatValue(absoluteChange)}
      </span>
      <span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : percentageChange > 0 ? 'text-[#4CAF50] dark:text-[#5B9A5D]' : 'text-[#9B9B9B] dark:text-[#666666]'}\`}>
        {formatValue(percentageChange)}%
      </span>
      <span 
        className={\`text-right text-[13px] md:text-[13px] font-medium tabular-nums \${trendColorClass}\`}
      >
        {formatPrice(currentAmount)}
      </span>
    </div>
  );
});`;

content = content.replace(target, replacement);

const callerTarget = `                  <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} baseAmount={displayAmount} roi={business.interestRate} overallTrend={overallTrend} isOpen={isMarketOpen} />`;

const callerReplacement = `                  <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} originalPrice={business.triggerAmount || 100} baseAmount={displayAmount} isOpen={isMarketOpen} />`;

content = content.replace(callerTarget, callerReplacement);

fs.writeFileSync('src/components/BusinessSidebar.tsx', content);
console.log('Fixed BusinessSidebar.tsx');
