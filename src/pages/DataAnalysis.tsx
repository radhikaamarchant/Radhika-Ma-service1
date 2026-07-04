import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import React, { useState } from"react";
import { useAppContext } from"../utils/AppContext";
import { useMarketSimulation } from"../utils/MarketSimulationContext";
import { formatINR } from"../utils/mockData";
import {
  AlertCircle,
  Lightbulb,
  Target,
  Trophy,
  Clock,
  PieChart as PieChartIcon,
  BadgeCheck,
  X,
  TrendingUp,
  Users,
  Info,
  Star,
  Search,
} from "lucide-react";
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
import { calculateLiveProfit } from"../utils/profitCalculator";
import AddInvestmentModal from "../components/AddInvestmentModal";

export default function DataAnalysis({ onNavigate }: { onNavigate?: (view: any) => void }) {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"investment" |"interest">("interest");
  const [activeTab, setActiveTab] = useState<string>("best-market");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalBusinessId, setAddModalBusinessId] = useState("");
  useMobileBackNavigation(!!selectedBusiness, () => setSelectedBusiness(null));

  const businessesWithStats = state.businesses.map((b) => {
    const overallTrend = marketState.trends[b.id] ?? b.interestRate;
    const bizInvs = state.investments.filter((i) => i.businessId === b.id);
    const totalInv = bizInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const liveTotalValue = bizInvs.reduce((sum, inv) => {
      if (inv.status ==="active") {
        const { currentValue } = calculateLiveProfit(
          [inv],
          b.id,
          marketState.trends,
          state.settings,
        );
        return sum + currentValue;
      }
      return sum + inv.amount;
    }, 0);
    const activeInvs = bizInvs.filter((i) => i.status === "active");
    const activeTotalInv = activeInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const activeLiveTotalValue = activeInvs.reduce((sum, inv) => {
      const { currentValue } = calculateLiveProfit(
        [inv],
        b.id,
        marketState.trends,
        state.settings,
      );
      return sum + currentValue;
    }, 0);
    const investorSet = new Set(bizInvs.map((i) => i.investorId));
    const investorCount = investorSet.size;
    const profitedInvestorsSet = new Set(
      bizInvs.filter((i) => i.status ==="completed").map((i) => i.investorId),
    );
    const profitedInvestorsCount = profitedInvestorsSet.size;
    const completedInvs = bizInvs.filter((i) => i.status ==="completed");
    const totalRet = completedInvs.reduce((sum, inv) => {
      const p = inv.payoutDetails;
      return (
        sum + (p ? p.totalCredited + p.rmasCommission + p.happyIncomeTax : 0)
      );
    }, 0);
    const avgReturnPct =
      completedInvs.length > 0
        ? completedInvs.reduce((sum, i) => sum + i.interestRate, 0) /
          completedInvs.length
        : b.interestRate;
    return {
      ...b,
      totalInv,
      liveTotalValue,
      activeTotalInv,
      activeLiveTotalValue,
      overallTrend,
      totalRet,
      investorCount,
      profitedInvestorsCount,
      activeInvsCount: bizInvs.length - completedInvs.length,
      completedInvsCount: completedInvs.length,
      avgReturnPct,
    };
  });
  const topInvested = [...businessesWithStats]
    .filter((b) => b.totalInv > 0)
    .sort((a, b) => b.liveTotalValue - a.liveTotalValue)
    .slice(0, 10);
  const topBacked = [...businessesWithStats]
    .filter((b) => b.investorCount > 0)
    .sort((a, b) => b.investorCount - a.investorCount)
    .slice(0, 10);
  const topEarners = [...businessesWithStats]
    .filter((b) => b.totalRet > 0)
    .sort((a, b) => b.totalRet - a.totalRet)
    .slice(0, 10);
  const untappedBusinesses = businessesWithStats.filter(
    (b) => b.totalInv === 0,
  );
  const newlyListed = [...businessesWithStats]
    .filter((b) => b.totalInv < b.fundingRequired * 0.5)
    .reverse()
    .slice(0, 8);
  const bestMarket = businessesWithStats
    .filter((b) => b.overallTrend >= b.interestRate + 10)
    .sort((a, b) => b.overallTrend - a.overallTrend);
  const overviewBusinesses = [...businessesWithStats]
    .filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.businessId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy ==="investment") {
        return b.liveTotalValue - a.liveTotalValue;
      }
      return a.interestRate - b.interestRate;
    });
  const statsMap = getVerificationStats(state.businesses, state.investments);
  // Business Analytics Details
  const renderBusinessDetails = (business: Business) => {
    const bizStats = businessesWithStats.find((b) => b.id === business.id);
    const bizInvestments = state.investments.filter(
      (i) => i.businessId === business.id,
    );
    const completedInvestments = bizInvestments.filter(
      (i) => i.status ==="completed",
    );
    const totalInvested = bizInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const fundingRemaining = Math.max(
      0,
      business.fundingRequired - totalInvested,
    );
    const fundingPercentage =
      business.fundingRequired > 0
        ? (totalInvested / business.fundingRequired) * 100
        : 0;
    let expectedProfitToPay = 0;
    let actualProfitPaid = 0;
    bizInvestments.forEach((inv) => {
      if (inv.status ==="completed") {
        const payout = inv.payoutDetails;
        if (payout) {
          const grossPayout =
            payout.totalCredited +
            payout.rmasCommission +
            payout.happyIncomeTax;
          actualProfitPaid += grossPayout - inv.amount;
        }
      } else {
        const expectedProfit = inv.amount * (inv.interestRate / 100);
        expectedProfitToPay = expectedProfit;
      }
    });
    const fundingData = [
      {
        name:"Funded",
        value: totalInvested,
        color:"var(--color-kite-green)",
      },
      {
        name:"Remaining",
        value: fundingRemaining,
        color:"var(--border-color-hard)",
      },
    ];
    const profitData = [
      {
        name:"Profit Paid",
        value: actualProfitPaid,
        color:"var(--color-kite-blue)",
      },
      {
        name:"Expected",
        value: expectedProfitToPay,
        color:"var(--text-color)",
      },
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
        <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-kite-surface border-b border-kite-border p-2 md:p-4 flex justify-between items-center z-10">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-[11px] md:text-[12px] text-kite-text flex items-center space-x-1">
                  <span>{business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}</span>{""}
                  {statsMap.get(business.id)?.isBlueTick && (
                    <BadgeCheck
                      className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500"
                      title="RMAS Verified"
                    />
                  )}{""}
                  {statsMap.get(business.id)?.isPreVerified && (
                    <Clock
                      className="w-4 h-4 md:w-5 md:h-5 text-kite-text"
                      title="Pre-Verified"
                    />
                  )}{""}
                </h3>
              </div>
              <p className="text-[11px] md:text-[12px] font-medium text-kite-text-light mt-0.5 tracking-wide uppercase">
                {""}
                {business.ownerName} &bull; {business.businessId}{""}
              </p>
            </div>
            <button
              onClick={() => setSelectedBusiness(null)}
              className="p-1.5 hover:bg-kite-bg rounded-full text-kite-text-light transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <div className="p-2 md:p-3 lg:p-5 space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-5 gap-2 md:gap-3">
              <div className="bg-kite-bg p-2 md:p-4 rounded-sm border border-kite-border flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] ] font-medium text-kite-text-light uppercase tracking-widest mb-0.5 md:mb-1">
                  Total Investors
                </p>
                <p className="text-[13px] md:text-[14px] font-medium text-kite-text leading-tight">
                  {bizStats?.investorCount || 0}
                </p>
                <p className="text-[10px] md:text-[11px] ] text-kite-text-light mt-0.5 md:mt-1 leading-tight">
                  Unique
                </p>
              </div>
              <div className="bg-kite-blue/10 p-2 md:p-4 rounded-sm border border-kite-blue/30 flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] ] font-medium text-kite-blue uppercase tracking-widest mb-0.5 md:mb-1">
                  Active
                </p>
                <p className="text-[13px] md:text-[14px] font-medium text-kite-blue leading-tight">
                  {bizStats?.activeInvsCount || 0}
                </p>
                <p className="text-[10px] md:text-[11px] ] text-kite-blue mt-0.5 md:mt-1 leading-tight">
                  Running
                </p>
              </div>
              <div className="bg-kite-green/10 p-2 md:p-4 rounded-sm border border-kite-green/30 flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] ] font-medium text-kite-green uppercase tracking-widest mb-0.5 md:mb-1">
                  Profited
                </p>
                <p className="text-[13px] md:text-[14px] font-medium text-kite-green leading-tight">
                  {bizStats?.profitedInvestorsCount || 0}
                </p>
                <p className="text-[10px] md:text-[11px] ] text-kite-green mt-0.5 md:mt-1 leading-tight">
                  Paid out
                </p>
              </div>
              <div className="bg-white dark:bg-kite-surface p-2 md:p-4 rounded-sm border border-kite-border flex flex-col justify-center">
                <p className="text-[10px] md:text-[11px] ] font-medium text-kite-text uppercase tracking-widest mb-0.5 md:mb-1">
                  Avg. Return
                </p>
                <p className="text-[13px] md:text-[14px] font-medium text-kite-text leading-tight">
                  {bizStats?.avgReturnPct.toFixed(1)}%
                </p>
                <p className="text-[10px] md:text-[11px] ] text-kite-text mt-0.5 md:mt-1 leading-tight">
                  Historical
                </p>
              </div>
              <div className="bg-kite-blue/10 p-2 md:p-4 rounded-sm border border-kite-blue/30 flex flex-col justify-center col-span-2 md:col-span-1">
                <p className="text-[10px] md:text-[11px] ] font-medium text-kite-blue uppercase tracking-widest mb-0.5 md:mb-1">
                  Live Trend
                </p>
                <div className="mt-0.5 md:mt-1.5 text-[13px] md:text-[14px] leading-tight">
                  <MarketTrendCell businessId={business.id} showIcon={true} />
                </div>
                <p className="text-[10px] md:text-[11px] ] text-kite-blue mt-0.5 md:mt-1 leading-tight">
                  Real-time stats
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white dark:bg-kite-surface">
                <h4 className="font-medium text-kite-text mb-4 text-center text-[13px] md:text-[14px]">
                  {""}
                  Funding Progress ({fundingPercentage.toFixed(1)}%){""}
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fundingData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill:"var(--text-light-color)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => formatINR(value)}
                        width={80}
                        tick={{ fontSize: 10, fill:"var(--text-light-color)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill:"var(--bg-color-alt)" }}
                        contentStyle={{
                          backgroundColor:"var(--surface-color)",
                          border:"1px solid var(--border-color)",
                          borderRadius:"2px",
                          fontSize:"12px",
                          color:"var(--text-color)",
                        }}
                        itemStyle={{ color:"var(--text-color)" }}
                        formatter={(value: number) => formatINR(value)}
                        labelStyle={{
                          color:"var(--text-light-color)",
                          marginBottom:"4px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      >
                        {""}
                        {fundingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}{""}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="w-full border border-kite-border rounded-sm p-2 md:p-4 bg-white dark:bg-kite-surface">
                <h4 className="font-medium text-kite-text mb-4 text-center text-[13px] md:text-[14px]">
                  {""}
                  Profit Distribution Status{""}
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={profitData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill:"var(--text-light-color)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => formatINR(value)}
                        width={80}
                        tick={{ fontSize: 10, fill:"var(--text-light-color)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill:"var(--bg-color-alt)" }}
                        contentStyle={{
                          backgroundColor:"var(--surface-color)",
                          border:"1px solid var(--border-color)",
                          borderRadius:"2px",
                          fontSize:"12px",
                          color:"var(--text-color)",
                        }}
                        itemStyle={{ color:"var(--text-color)" }}
                        formatter={(value: number) => formatINR(value)}
                        labelStyle={{
                          color:"var(--text-light-color)",
                          marginBottom:"4px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      >
                        {""}
                        {profitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}{""}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div
              className={`bg-kite-bg text-kite-text p-1.5 md:p-3 md:p-5 rounded-sm relative overflow-hidden`}
            >
              <div className="relative z-10">
                <h4 className="font-medium text-[13px] md:text-[14px] mb-2 flex items-center space-x-2">
                  <Lightbulb
                    className={`w-3 md:w-4 h-3 md:h-4 ${statsMap.get(business.id)?.isBlueTick ?"text-kite-blue flex-shrink-0" : statsMap.get(business.id)?.isPreVerified ?"text-kite-text flex-shrink-0" :"text-kite-text flex-shrink-0"}`}
                  />
                  <span>RMAS Advisory Summary</span>
                </h4>
                <div className="space-y-2 text-[13px] md:text-[14px] text-kite-text">
                  {""}
                  {bizStats?.totalInv === 0 && (
                    <p>
                      • આ કંપનીમાં હજુ સુધી કોઈએ રોકાણ કર્યું નથી. આ{""}
                      <strong>Newly Untapped</strong> તક છે. તમે રોકાણકારોને{""}
                      <strong>{bizStats.interestRate}%</strong> ના ફિક્સ વળતર
                      માટે આની ખાતરી આપી શકો છો.
                    </p>
                  )}{""}
                  {bizStats &&
                    bizStats.totalInv > 0 &&
                    bizStats.totalRet === 0 && (
                      <p>
                        • આ બિઝનેસમાં અત્યાર સુધી{""}
                        <strong>{formatINR(bizStats.totalInv)}</strong> નું
                        રોકાણ થયું છે. રોકાણ ચાલુ છે, પરંતુ વળતર મળવાનું બાકી
                        છે. વધુ રોકાણકારો માટે આ મધ્યમ-જોખમી (Medium Risk)
                        પ્રોફાઇલ ગણી શકાય.
                      </p>
                    )}{""}
                  {bizStats && bizStats.totalRet > 0 && (
                    <p>
                      • આ <strong>RMAS Verified </strong> કંપની છે. અત્યાર
                      સુધીમાં{""}
                      <strong>
                        {bizStats.profitedInvestorsCount} રોકાણકારો
                      </strong>{""}
                      આરામથી <strong>{formatINR(actualProfitPaid)}</strong>{""}
                      જેટલું નફો કમાઈ ચૂક્યા છે. નવા રોકાણકારો માટે આ{""}
                      <strong>અત્યંત સુરક્ષિત</strong> અને ભરોસાપાત્ર વિકલ્પ છે.
                    </p>
                  )}{""}
                  {bizStats && bizStats.investorCount > 5 && (
                    <p>
                      • <strong>Most Backed:</strong> આ કંપનીમાં સૌથી વધુ (
                      <strong>{bizStats.investorCount}</strong>) ઇન્વેસ્ટરે
                      વિશ્વાસ દાખવ્યો છે.
                    </p>
                  )}{""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderLiveAmount = (b: any, defaultClass: string ="") => {
    if (b.totalInv === 0)
      return <span className={defaultClass}>{formatINR(b.totalInv)}</span>;
    const isUp = b.overallTrend >= b.interestRate;
    const colorClass = isUp ?"text-kite-green" :"text-kite-red";
    return (
      <span className={`${colorClass} ${defaultClass}`}>
        {formatINR(b.liveTotalValue)}
      </span>
    );
  };
  return (
    <>
      <div className="w-full md:hidden pb-4">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-kite-border/50 bg-white dark:bg-kite-bg sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#8F8F8F]" />
            <input 
              type="text"
              placeholder="Search Eg: Radhika Kite Trade"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors font-sans"
            />
          </div>
        </div>
        <div className="flex flex-col">
          {businessesWithStats
            .filter((b) =>
              b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((b) => {
            const isUp = b.overallTrend >= b.interestRate;
            const trendColor = isUp ? "text-kite-green" : "text-kite-red";
            return (
              <div 
                key={b.id}
                onClick={() => {
                  if (onNavigate) {
                    sessionStorage.setItem("mobileAddInvestmentBusinessId", b.id);
                    window.dispatchEvent(new Event("mobileNavigateToInvestments"));
                    onNavigate("investments");
                  }
                }}
                className="bg-white dark:bg-kite-bg border-b border-kite-border/40 py-3 px-4 flex justify-between items-center active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-[13px] text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</span>
                  <span className="text-[10px] text-kite-text/60 mt-0.5 uppercase tracking-wider">{b.ownerName}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-medium text-[13px] ${trendColor}`}>
                    {b.activeTotalInv === 0 ? formatINR(0) : formatINR(b.activeLiveTotalValue)}
                  </span>
                  <span className={`text-[10px] font-medium mt-0.5 ${trendColor}`}>
                    {b.overallTrend > 0 ? "+" : ""}{b.overallTrend.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full space-y-6 hidden md:block">
        <div className="px-4 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
          <div>
            <h2 className="text-[15px] md:text-[16px] font-medium text-kite-text tracking-tight">
              Marketwatch
            </h2>
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-white dark:bg-kite-bg pt-2 pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex overflow-x-auto no-scrollbar border-b border-kite-border/50 items-center whitespace-nowrap">
            {[
              { id:"best-market", label:"Best Market", type:"scroll" },
              { id:"top-backed", label:"Top Backed", type:"category" },
              { id:"top-invested", label:"Top Invested", type:"category" },
              { id:"top-earners", label:"Top Earners", type:"category" },
              { id:"newly-listed", label:"Newly Listed", type:"category" },
              { id:"untapped", label:"Untapped", type:"category" },
              { id:"market-overview", label:"Market Overview", type:"scroll" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-[13px] md:text-[14px] font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-kite-blue"
                    : "text-kite-text-light hover:text-kite-text"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pb-8">
          <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden w-full">
            <div className="divide-y divide-kite-border">
              {(
                activeTab === "best-market" ? bestMarket :
                activeTab === "top-backed" ? topBacked :
                activeTab === "top-invested" ? topInvested :
                activeTab === "top-earners" ? topEarners :
                activeTab === "newly-listed" ? newlyListed :
                activeTab === "untapped" ? untappedBusinesses :
                overviewBusinesses
              ).length > 0 ? (
                (
                  activeTab === "best-market" ? bestMarket :
                  activeTab === "top-backed" ? topBacked :
                  activeTab === "top-invested" ? topInvested :
                  activeTab === "top-earners" ? topEarners :
                  activeTab === "newly-listed" ? newlyListed :
                  activeTab === "untapped" ? untappedBusinesses :
                  overviewBusinesses
                ).map(b => (
                  <div key={b.id} onClick={() => {
    if (onNavigate) {
      sessionStorage.setItem("mobileAddInvestmentBusinessId", b.id);
      window.dispatchEvent(new Event("mobileNavigateToInvestments"));
      onNavigate("investments");
    }
  }} className="p-4 flex justify-between items-center hover:bg-kite-bg/50 transition-colors cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>
                      <span className="text-xs text-kite-text/60 mt-0.5">{b.ownerName}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      {renderLiveAmount(b, "font-medium text-[15px]")}
                      <span className={`text-[12px] font-medium ${b.overallTrend >= b.interestRate ? 'text-kite-green' : 'text-kite-red'}`}>
                        {b.overallTrend >= b.interestRate ? "+" : ""}{b.overallTrend.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-kite-text-light text-[14px]">No businesses found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedBusiness && renderBusinessDetails(selectedBusiness)}
      
      {showAddModal && (
        <AddInvestmentModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setAddModalBusinessId("");
          }}
          initialBusinessId={addModalBusinessId}
        />
      )}
    </>
  );
}
