import fs from 'fs';

let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

const targetImport = `import { useAppContext } from "../utils/AppContext";
import { Search } from "lucide-react";`;
const replacementImport = `import { useAppContext } from "../utils/AppContext";
import { Search } from "lucide-react";
import { useMarketSimulation } from "../utils/MarketSimulationContext";`;

code = code.replace(targetImport, replacementImport);

const targetComp = `const LiveSidebarValue = ({ baseAmount, roi }: { baseAmount: number; roi: number }) => {
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
      <span className={\`font-medium text-[11px] lg:text-[12px] transition-colors duration-300 \${flash === "up" ? "text-kite-green" : flash === "down" ? "text-kite-red" : "text-kite-text"}\`}>
        ₹{currentAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </span>
      <span className={\`text-[10px] \${isPositive ? "text-kite-green" : "text-kite-red"}\`}>
        {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
      </span>
    </div>
  );
};`;

const replacementComp = `const LiveSidebarValue = ({ baseAmount, roi, overallTrend }: { baseAmount: number; roi: number; overallTrend: number }) => {
  const [currentAmount, setCurrentAmount] = useState(baseAmount);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  
  useEffect(() => {
    let current = baseAmount || 10000;
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
  }, [baseAmount]);

  // Use the actual overall trend instead of the random fluctuation for percentage
  const isPositive = overallTrend >= roi;

  return (
    <div className="flex flex-col items-end">
      <span className={\`font-medium text-[11px] lg:text-[12px] transition-colors duration-300 \${flash === "up" ? "text-kite-green" : flash === "down" ? "text-kite-red" : "text-kite-text"}\`}>
        ₹{currentAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </span>
      <span className={\`text-[10px] \${isPositive ? "text-kite-green" : "text-kite-red"}\`}>
        {isPositive ? "+" : ""}{overallTrend.toFixed(2)}%
      </span>
    </div>
  );
};`;

code = code.replace(targetComp, replacementComp);

const targetHook = `export default function BusinessSidebar() {
  const { state } = useAppContext();`;

const replacementHook = `export default function BusinessSidebar() {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();`;

code = code.replace(targetHook, replacementHook);

const targetMap = `        {filteredBusinesses.map((business, index) => {
          const totalInvested = state.investments.filter(i => i.businessId === business.id).reduce((sum, inv) => sum + inv.amount, 0);
          
          return (
          <div`;

const replacementMap = `        {filteredBusinesses.map((business, index) => {
          const totalInvested = state.investments.filter(i => i.businessId === business.id).reduce((sum, inv) => sum + inv.amount, 0);
          const overallTrend = marketState.trends[business.id] ?? business.interestRate;
          
          return (
          <div`;

code = code.replace(targetMap, replacementMap);

const targetRender = `<LiveSidebarValue baseAmount={totalInvested} roi={business.interestRate} />`;
const replacementRender = `<LiveSidebarValue baseAmount={totalInvested} roi={business.interestRate} overallTrend={overallTrend} />`;

code = code.replace(targetRender, replacementRender);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
console.log("Success");
