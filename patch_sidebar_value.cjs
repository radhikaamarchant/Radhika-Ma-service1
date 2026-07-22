const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

const oldComponent = `const LiveSidebarValue = ({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {
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

  const absoluteChange = (displayBase * overallTrend) / 100;
  
  const getTrendColorClass = (flashState: "up" | "down" | null, isMarketOpen: boolean) => {
    if (isMarketOpen && flashState === "up") return "text-[#4CAF50] dark:text-[#5B9A5D]";
    if (isMarketOpen && flashState === "down") return "text-[#DF514C] dark:text-[#E25F5B]";
    return overallTrend > 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : overallTrend < 0 ? "text-[#DF514C] dark:text-[#E25F5B]" : "text-kite-text dark:text-[#e0e0e0]";
  };

  const trendColorClass = getTrendColorClass(flash, isOpen);

  const formatValue = (val: number) => {
    return val.toFixed(2);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_55px_60px_65px] gap-x-[8px] items-center w-full">
      <span 
        className={\`text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis uppercase \${trendColorClass}\`}
      >
        {name}
      </span>
      <span className="text-right text-[13px] font-medium text-[#9B9B9B] dark:text-[#666666]">
        {formatValue(absoluteChange)}
      </span>
      <span className="text-right text-[13px] font-medium text-[#444444D9] dark:text-[#BBBBBBD9]">
        {formatValue(overallTrend)}%
      </span>
      <span 
        className={\`text-right text-[13px] font-medium tabular-nums \${trendColorClass}\`}
      >
        {formatPrice(currentAmount)}
      </span>
    </div>
  );
};`;

const newComponent = `const LiveSidebarValue = ({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {
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

  const absoluteChange = (displayBase * overallTrend) / 100;
  
  const getTrendColorClass = (flashState: "up" | "down" | null, isMarketOpen: boolean) => {
    if (isMarketOpen && flashState === "up") return "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] dark:md:text-[#5B9A5D]";
    if (isMarketOpen && flashState === "down") return "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] dark:md:text-[#E25F5B]";
    return overallTrend > 0 
      ? "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] dark:md:text-[#5B9A5D]" 
      : overallTrend < 0 
        ? "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] dark:md:text-[#E25F5B]" 
        : "text-kite-text dark:text-[#e0e0e0] md:text-[#9B9B9B] dark:md:text-[#666666]"; // default neutral
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
      <span className="text-right text-[13px] md:text-[13px] font-medium text-[#9B9B9B] dark:text-[#666666] md:text-[#9B9B9B] dark:md:text-[#666666]">
        {formatValue(absoluteChange)}
      </span>
      <span className="text-right text-[13px] md:text-[13px] font-medium text-[#444444D9] dark:text-[#BBBBBBD9] md:text-[#444444D9] dark:md:text-[#BBBBBBD9]">
        {formatValue(overallTrend)}%
      </span>
      <span 
        className={\`text-right text-[13px] md:text-[13px] font-medium tabular-nums \${trendColorClass}\`}
      >
        {formatPrice(currentAmount)}
      </span>
    </div>
  );
};`;

if (code.includes(oldComponent)) {
    code = code.replace(oldComponent, newComponent);
    console.log("Replaced LiveSidebarValue component successfully.");
} else {
    console.log("Failed to replace LiveSidebarValue. Checking if exact match is failing...");
}

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
