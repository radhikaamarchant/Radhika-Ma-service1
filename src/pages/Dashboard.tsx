import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import React, { useState } from"react";
import { useAppContext } from"../utils/AppContext";
import { formatINR } from"../utils/mockData";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Wallet,
  BadgeCheck,
  X,
  Building,
  PieChart as PieChartIcon,
  Search,
  Lightbulb,
  Target,
  Trophy,
  Clock,
} from"lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from"recharts";
import { Business } from"../types";
import { getVerificationStats } from"../utils/blueTick";
import { MarketTrendCell } from"../components/MarketTrendCell";
import { getUnifiedBankBalance } from"../utils/bankBalance";
import { calculateLiveProfit } from"../utils/profitCalculator";
import { useMarketSimulation } from"../utils/MarketSimulationContext";
export default function Dashboard() {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  useMobileBackNavigation(!!selectedBusiness, () => setSelectedBusiness(null));
 

// Calculate stats

const totalBusinesses = state.businesses.length; const totalInvestors = state.investors.length; const totalFundingRequired = state.businesses .filter(b => b.status === 'listed') .reduce((sum, b) => sum + b.fundingRequired, 0); const totalCommissions = getUnifiedBankBalance('Radhika M', state.businesses, state.investors, state.investments, state.settings); const stats = [ { label: 'RMAS Profit Balance', value: formatINR(totalCommissions), icon: TrendingUp, positive: true }, { label: 'Registered Businesses', value: totalBusinesses, icon: Wallet, positive: false }, { label: 'Total Investors', value: totalInvestors, icon: Users, positive: false }, { label: 'Funding Needed (Listed)', value: formatINR(totalFundingRequired), icon: ArrowUpRight, positive: false }, ]; 

// Top Businesses by Interest Rate

const topBusinesses = [...state.businesses] .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0)) .filter(b => (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (b.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase())); 
// Top Performing / Blue Tick Businesses (High Investment & High Returns)
 const businessesWithStats = state.businesses.map(b => { const bizInvs = state.investments.filter(i => i.businessId === b.id); const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0); const totalRet = bizInvs.filter(i => i.status === 'completed').reduce((sum, inv) => { const p = inv.payoutDetails; return sum + (p ? (p.totalCredited + p.rmasCommission + p.happyIncomeTax) : 0); }, 0); return { ...b, totalInv, totalRet }; }); 

// Data Analysis Setup

const highestInvested = [...businessesWithStats].sort((a, b) => b.totalInv - a.totalInv)[0]; const highestProfit = [...businessesWithStats].sort((a, b) => b.totalRet - a.totalRet)[0]; const untappedBusinesses = businessesWithStats.filter(b => b.totalInv === 0); const newlyListed = [...state.businesses].reverse().slice(0, 3); 

// Since they are appended

const statsMap = getVerificationStats(state.businesses, state.investments); const blueTickBusinesses = businessesWithStats .filter(b => statsMap.get(b.id)?.isBlueTick) .sort((a, b) => b.totalRet - a.totalRet) .slice(0, 4) .filter(b => (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (b.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase())); const preVerifiedBusinesses = businessesWithStats .filter(b => statsMap.get(b.id)?.isPreVerified) .sort((a, b) => b.totalRet - a.totalRet) .filter(b => (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (b.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase())); const otherBusinesses = topBusinesses.filter(b => { const stats = statsMap.get(b.id); return !stats?.isBlueTick && !stats?.isPreVerified; }); const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0; const recentFilteredInvestments = state.investments.slice() .sort((a, b) => getTime(b.id) - getTime(a.id)) .filter(inv => { const business = state.businesses.find(b => b.id === inv.businessId); const investor = state.investors.find(i => i.id === inv.investorId); const match = searchTerm.toLowerCase(); return (business?.name || "").toLowerCase().includes(match) || (investor?.name || "").toLowerCase().includes(match); }); 

// Business Analytics Details

const renderBusinessDetails = (business: Business) => { const bizInvestments = state.investments.filter(i => i.businessId === business.id); const totalInvested = bizInvestments.reduce((sum, inv) => sum + inv.amount, 0); const fundingRemaining = Math.max(0, business.fundingRequired - totalInvested); const fundingPercentage = business.fundingRequired > 0 ? (totalInvested / business.fundingRequired) * 100 : 0; 

// Calculate profits

let expectedProfitToPay = 0; let actualProfitPaid = 0; bizInvestments.forEach(inv => { if (inv.status === 'completed') { const payout = inv.payoutDetails; if (payout) { 
// Profit paid is what total credited is minus the invested amount, and plus taxes/fees if we consider profit generated by business.
 
// Or we just display the raw profit derived from payout.
// A simple way: Profit paid to investor is just the gross profit before deductions, since that's what the business paid!
 const grossPayout = payout.totalCredited + payout.rmasCommission + payout.happyIncomeTax; actualProfitPaid += (grossPayout - inv.amount); } else { 
// fallback
actualProfitPaid += inv.amount * ((inv.interestRate || business.interestRate) / 100); } } else { const { liveProfit } = calculateLiveProfit([inv], business.id, marketState.trends, state.settings); expectedProfitToPay += liveProfit; } }); const fundingData = [ { name: 'Invested', value: totalInvested, color: '#4caf50' }, 
// Green
{ name: 'Remaining', value: fundingRemaining, color: '#eeeeee' } 
// Gray
]; const profitData = [ { name: 'Paid Back (Profit)', value: actualProfitPaid, color: '#4184f3' }, 
// Blue
{ name: 'Expected (Pending)', value: expectedProfitToPay, color: '#000000' } 
// Orange
];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-kite-surface rounded-sm max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[17px] md:text-[18px] font-medium text-kite-text">{business.shortName ? business.shortName.toUpperCase() : business.name} Details</h2>
          <button onClick={() => setSelectedBusiness(null)} className="text-kite-text-light hover:text-kite-text"><X className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-kite-border rounded-sm">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase">Total Invested</p>
             <p className="text-[20px] md:text-[22px] font-medium text-kite-text">{formatINR(totalInvested)}</p>
          </div>
          <div className="p-4 border border-kite-border rounded-sm">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase">Actual Profit Paid</p>
             <p className="text-[20px] md:text-[22px] font-medium text-kite-blue">{formatINR(actualProfitPaid)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

return (
  <div className="flex-1 overflow-auto bg-kite-bg">
    <div className="w-full">
      
      <div className="flex justify-between items-center p-4 border-b border-kite-border">
        <h1 className="text-[17px] md:text-[18px] font-medium text-kite-text uppercase">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-kite-border border-b border-kite-border bg-white dark:bg-kite-surface">
        {stats.map((stat, i) => (
          <div key={i} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wider">{stat.label}</p>
                <p className="text-[20px] md:text-[22px] font-medium text-kite-text mt-2">{stat.value}</p>
              </div>
              <stat.icon className="w-4 h-4 text-kite-blue mt-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-kite-surface mt-4 border-y border-kite-border">
        <div className="p-4 border-b border-kite-border">
           <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text uppercase tracking-wider">Recent Investments</h2>
        </div>
        <div className="divide-y divide-kite-border">
           {recentFilteredInvestments.map((inv, idx) => {
              const business = state.businesses.find(b => b.id === inv.businessId);
              const investor = state.investors.find(i => i.id === inv.investorId);
              return (
                <div key={`dash_inv_${inv.id}_${idx}`} className="p-4 flex justify-between items-center">
                   <div>
                     <p className="font-normal text-[13px] md:text-[14px] uppercase text-kite-text">{business?.name}</p>
                     <p className="text-[11px] md:text-[12px] text-kite-text-light">{investor?.name}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium text-[13px] md:text-[14px] text-kite-text">{formatINR(inv.amount)}</p>
                     <p className="text-[11px] md:text-[12px] text-kite-green font-medium">{inv.interestRate}% Int.</p>
                   </div>
                </div>
              )
           })}
           {recentFilteredInvestments.length === 0 && (
              <div className="p-6 text-center text-kite-text-light text-[13px] md:text-[14px]">No recent investments</div>
           )}
        </div>
      </div>
    </div>
    {selectedBusiness && renderBusinessDetails(selectedBusiness)}
  </div>
);
}
