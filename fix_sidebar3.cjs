const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf-8');

const startIdx = content.indexOf('const LiveSidebarValue =');
const endIdx = content.indexOf('});', startIdx) + 3;

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
    return percentageChange >= 0 
      ? "text-[#4CAF50] dark:text-[#5B9A5D] md:text-[#4CAF50] md:dark:text-[#5B9A5D]" 
      : "text-[#DF514C] dark:text-[#E25F5B] md:text-[#DF514C] md:dark:text-[#E25F5B]";
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
      <span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : 'text-[#4CAF50] dark:text-[#5B9A5D]'}\`}>
        {formatValue(absoluteChange)}
      </span>
      <span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : 'text-[#4CAF50] dark:text-[#5B9A5D]'}\`}>
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

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
content = content.replace(/<LiveSidebarValue name=\{business\.shortName \? business\.shortName\.toUpperCase\(\) : business\.name\} baseAmount=\{displayAmount\} roi=\{business\.interestRate\} overallTrend=\{overallTrend\} isOpen=\{isMarketOpen\} \/>/g, '<LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} originalPrice={business.triggerAmount || 100} baseAmount={displayAmount} isOpen={isMarketOpen} />');

fs.writeFileSync('src/components/BusinessSidebar.tsx', content);
console.log("Fixed again");
