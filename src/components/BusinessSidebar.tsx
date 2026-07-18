import { useState, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { Search } from "lucide-react";
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
  const isPositive = overallTrend >= roi;

  // If market is closed, set the text color statically based on overall trend.
  const amountColorClass = !isOpen 
    ? (isPositive ? "text-kite-green" : "text-kite-red") 
    : (flash === "up" ? "text-kite-green" : flash === "down" ? "text-kite-red" : "text-kite-text");

  return (
    <div className="grid grid-cols-[1fr_65px_80px] lg:grid-cols-[1fr_75px_90px] gap-2 items-center w-full">
      <div className="min-w-0 pr-1 text-left">
        <span className="text-[12px] lg:text-[13px] font-medium text-kite-text truncate block uppercase">{name}</span>
      </div>
      <div className="text-right whitespace-nowrap">
        <span className={`text-[11px] lg:text-[12px] tabular-nums ${isPositive ? "text-kite-green" : "text-kite-red"}`}>
          {isPositive ? "+" : ""}{overallTrend.toFixed(2)}%
        </span>
      </div>
      <div className="text-right whitespace-nowrap">
        <span className={`font-medium text-[12px] lg:text-[13px] transition-colors duration-300 tabular-nums ${amountColorClass}`}>
          {formatPrice(currentAmount)}
        </span>
      </div>
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
    <div className="w-full h-full flex flex-col bg-kite-bg relative">
      {/* Search Bar */}
      <div className="p-3 border-b border-kite-border bg-gray-50/50 dark:bg-kite-bg">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-kite-text-light" />
          <input
            type="text"
            placeholder="Search companies (eg. RIL, TCS)"
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-kite-surface border border-kite-border rounded-sm focus:outline-none focus:border-kite-blue focus:ring-1 focus:ring-kite-blue transition-all dark:text-kite-text placeholder:text-kite-text-light"
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
            className="px-4 py-[12px] cursor-pointer border-b border-kite-border hover:bg-gray-50 dark:hover:bg-kite-surface transition-colors group bg-kite-bg"
            onClick={() => {
              setInvestBusinessId(business.id);
              setShowInvestModal(true);
            }}
          >
            <LiveSidebarValue name={business.shortName ? business.shortName.toUpperCase() : business.name} baseAmount={displayAmount} roi={business.interestRate} overallTrend={overallTrend} isOpen={isMarketOpen} />
          </div>
        )})}
        {filteredBusinesses.length === 0 && (
          <div className="p-8 text-center text-[12px] text-kite-text-light">
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
