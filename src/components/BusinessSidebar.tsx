import { useState, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { Search } from "lucide-react";
import AddInvestmentModal from "./AddInvestmentModal";

const LiveSidebarValue = ({ baseAmount, roi }: { baseAmount: number; roi: number }) => {
  const [currentAmount, setCurrentAmount] = useState(baseAmount);
  const [percentChange, setPercentChange] = useState(0);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  
  useEffect(() => {
    let current = baseAmount || 10000;
    const interval = setInterval(() => {
      const change = current * (Math.random() * 0.002 - 0.001); // +/- 0.1% change
      const newAmount = current + change;
      let pChange = 0;
      if (baseAmount > 0) {
         pChange = ((newAmount - baseAmount) / baseAmount) * 100;
      } else {
         pChange = ((newAmount - 10000) / 10000) * 100;
      }
      
      setCurrentAmount(newAmount);
      setPercentChange(pChange);
      
      if (newAmount > current) setFlash("up");
      else if (newAmount < current) setFlash("down");
      
      current = newAmount;
      
      setTimeout(() => setFlash(null), 300);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [baseAmount]);

  const isPositive = percentChange >= 0;

  return (
    <div className="flex flex-col items-end">
      <span className={`font-medium text-[11px] lg:text-[12px] transition-colors duration-300 ${flash === "up" ? "text-kite-green" : flash === "down" ? "text-kite-red" : "text-kite-text"}`}>
        ₹{currentAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </span>
      <span className={`text-[10px] ${isPositive ? "text-kite-green" : "text-kite-red"}`}>
        {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
      </span>
    </div>
  );
};

export default function BusinessSidebar() {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investBusinessId, setInvestBusinessId] = useState("");

  const filteredBusinesses = state.businesses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          const totalInvested = state.investments.filter(i => i.businessId === business.id).reduce((sum, inv) => sum + inv.amount, 0);
          
          return (
          <div
            key={business.id}
            className="px-4 py-2.5 flex items-start justify-between cursor-pointer border-b border-kite-border hover:bg-gray-50 dark:hover:bg-kite-surface transition-colors group bg-kite-bg"
            onClick={() => {
              setInvestBusinessId(business.id);
              setShowInvestModal(true);
            }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] lg:text-[13px] font-medium text-kite-text truncate lg:tracking-tight uppercase">{business.name}</h4>
                  <LiveSidebarValue baseAmount={totalInvested} roi={business.interestRate} />
                </div>
                <div className="flex items-center justify-between mt-[2px]">
                  <span className="text-[11px] text-kite-blue truncate uppercase">
                    {business.ownerName}
                  </span>
                </div>
              </div>
            </div>
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
