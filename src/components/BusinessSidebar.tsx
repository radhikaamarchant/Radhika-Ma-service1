import { useState, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { useTheme } from "../utils/ThemeContext";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { getBaseMarketTrend, getCurrentMarketPrice } from "../utils/marketSimulator";
import { getMarketTimeContext } from "../utils/marketTiming";
import AddInvestmentModal from "./AddInvestmentModal";

const formatPrice = (num: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const LiveSidebarValue = ({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {
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
        className={`text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis uppercase ${trendColorClass}`}
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
        className={`text-right text-[13px] font-medium tabular-nums ${trendColorClass}`}
      >
        {formatPrice(currentAmount)}
      </span>
    </div>
  );
};

export default function BusinessSidebar() {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();
  const timeCtx = getMarketTimeContext(state.settings);
  const isMarketOpen = timeCtx.isOpen;

  const [searchTerm, setSearchTerm] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investBusinessId, setInvestBusinessId] = useState("");

  const filteredBusinesses = state.businesses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-kite-surface dark:md:bg-[#181818] relative">
      {/* Search Bar */}
      <div className="p-3 border-b border-kite-border dark:border-[#2b2b2b] bg-gray-50/50 dark:bg-kite-surface dark:md:bg-[#181818]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-kite-text-light dark:text-[#9b9b9b]" />
          <input
            type="text"
            placeholder="Search companies (eg. RIL, TCS)"
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-white dark:bg-kite-surface dark:md:bg-[#181818] border border-kite-border dark:border-[#2b2b2b] rounded-sm focus:outline-none focus:border-kite-blue focus:ring-1 focus:ring-kite-blue transition-all text-kite-text dark:text-[#e0e0e0] placeholder:text-kite-text-light dark:placeholder:text-[#9b9b9b]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredBusinesses.map((business, index) => {
          const overallTrend = marketState.trends[business.id] ?? business.interestRate;
          
          const displayAmount = getCurrentMarketPrice(business, state.investments);
          
          return (
          <div
            key={business.id}
            style={{ padding: "10px 12px" }} className="cursor-pointer border-b border-kite-border dark:border-[#2b2b2b] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group bg-white dark:bg-kite-surface dark:md:bg-[#181818]"
            onClick={() => {
              setInvestBusinessId(business.id);
              setShowInvestModal(true);
            }}
          >
            <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} baseAmount={displayAmount} roi={business.interestRate} overallTrend={overallTrend} isOpen={isMarketOpen} />
          </div>
        )})}
        {filteredBusinesses.length === 0 && (
          <div className="p-8 text-center text-[12px] text-kite-text-light dark:text-[#9b9b9b]">
            No businesses found.
          </div>
        )}
      </div>

      <AddInvestmentModal 
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        initialBusinessId={investBusinessId}
      />
    </div>
  );
}
