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
import { calculateLiveProfit } from"../utils/profitCalculator";
export default function DataAnalysis() {
  const { state } = useAppContext();
  const { marketState } = useMarketSimulation();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"investment" |"interest">("interest");
  const [activeTab, setActiveTab] = useState<string>("best-market");
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
                  <span>{business.name?.toUpperCase()}</span>{""}
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
    <div className="w-full space-y-6">
      <div className="px-4 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
        <div>
          <h2 className="text-[15px] md:text-[16px] font-medium text-kite-text tracking-tight">
            Marketwatch
          </h2>
        </div>
      </div>{""}
      {/* Top Tab Bar (Zerodha Style) */}{""}
      <div className="sticky top-0 z-40 bg-white dark:bg-kite-bg pt-2 pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex overflow-x-auto no-scrollbar border-b border-kite-border/50 items-center whitespace-nowrap">
          {""}
          {[
            { id:"best-market", label:"Best Market", type:"scroll" },
            { id:"top-backed", label:"Top Backed", type:"category" },
            { id:"top-invested", label:"Top Invested", type:"category" },
            { id:"top-earners", label:"Top Earners", type:"category" },
            { id:"newly-listed", label:"Newly Listed", type:"category" },
            { id:"untapped", label:"Untapped", type:"category" },
            { id:"market-overview", label:"Market Overview", type:"scroll" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 pb-3 text-[13px] md:text-[14px] whitespace-nowrap flex-shrink-0 transition-colors relative ${activeTab === tab.id ?"text-kite-blue dark:text-kite-text font-medium" :"text-kite-text-light dark:text-kite-text-light hover:text-kite-text dark:hover:text-kite-text font-medium"}`}
            >
              {""}
              {tab.label}{""}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue"></span>
              )}{""}
            </button>
          ))}{""}
        </div>
      </div>{""}
      {/* 1. Best Market Section */}{""}
      {activeTab ==="best-market" && (
        <div className="scroll-mt-24">
          <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden w-full">
            <div className="p-2 md:p-4 border-b border-kite-border">
              <h3 className="font-medium text-kite-text flex items-center space-x-2">
                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-green" />
                <span>Best Market</span>
              </h3>
              <p className="text-[11px] md:text-[12px] text-kite-text-light mt-1">
                Live trend &ge; 10% above base interest.
              </p>
            </div>
            <div className="divide-y divide-kite-border max-h-[400px] overflow-y-auto">
              {""}
              {bestMarket.length > 0 ? (
                bestMarket.map((b) => (
                  <div
                    key={b.id}
                    onClick={() =>
                      setSelectedBusiness(
                        state.businesses.find((biz) => biz.id === b.id) || null,
                      )
                    }
                    className="p-1.5 md:p-3 hover:bg-kite-green/5 cursor-pointer transition-colors flex justify-between items-center group"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-medium text-[13px] md:text-[14px] text-kite-text group-hover:text-kite-green truncate flex items-center space-x-1">
                        <span>{b.name?.toUpperCase()}</span>{""}
                        {statsMap.get(b.id)?.isBlueTick && (
                          <BadgeCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500" />
                        )}{""}
                        {statsMap.get(b.id)?.isPreVerified && (
                          <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text" />
                        )}{""}
                      </h4>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light mt-0.5">
                        Base: {b.interestRate}%
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-green">
                        {b.overallTrend.toFixed(1)}%
                      </p>
                      <p className="text-[10px] md:text-[11px] text-kite-green uppercase tracking-wider mt-0.5">
                        Live Trend
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-kite-text-light opacity-50" />
                  <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                    No data available
                  </p>
                  <p className="text-[11px] md:text-[12px] text-kite-text-light text-center">
                    Data will appear here once records are available.
                  </p>
                </div>
              )}{""}
            </div>
          </div>
        </div>
      )}{""}
      {/* 2. Category Business List Section */}{""}
      {["top-backed","top-invested","top-earners","newly-listed","untapped",
      ].includes(activeTab) && (
        <div className="scroll-mt-24">
          {""}
          {(() => {
            let currentList: any[] = [];
            let icon = null;
            let title ="";
            let desc ="";
            switch (activeTab) {
              case"top-backed":
                currentList = topBacked;
                icon = (
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                );
                title ="Top Backed";
                desc ="Highest unique investors.";
                break;
              case"top-invested":
                currentList = topInvested;
                icon = (
                  <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                );
                title ="Top Invested";
                desc ="Highest capital invested.";
                break;
              case"top-earners":
                currentList = topEarners;
                icon = (
                  <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-green" />
                );
                title ="Top Earners";
                desc ="Highest payouts delivered.";
                break;
              case"newly-listed":
                currentList = newlyListed;
                icon = (
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text" />
                );
                title ="Newly Listed";
                desc ="Latest additions.";
                break;
              case"untapped":
                currentList = untappedBusinesses;
                icon = (
                  <PieChartIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text" />
                );
                title ="Untapped";
                desc ="Fresh opportunities.";
                break;
            }
            return (
              <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden w-full">
                <div className="p-2 md:p-4 border-b border-kite-border flex justify-between items-center bg-kite-bg/50 dark:bg-transparent">
                  <div>
                    <h3 className="font-medium text-kite-text flex items-center space-x-2">
                      {""}
                      {icon} <span>{title}</span>
                    </h3>
                    <p className="text-[11px] md:text-[12px] text-kite-text-light mt-1">
                      {desc}
                    </p>
                  </div>
                  <div className="text-[11px] md:text-[12px] text-kite-text-light font-medium bg-white dark:bg-kite-surface px-2 py-1 border border-kite-border rounded-sm">
                    {""}
                    {currentList.length} items{""}
                  </div>
                </div>
                <div className="divide-y divide-kite-border max-h-[400px] overflow-y-auto">
                  {""}
                  {currentList.length > 0 ? (
                    currentList.map((b) => (
                      <div
                        key={b.id}
                        onClick={() =>
                          setSelectedBusiness(
                            state.businesses.find((biz) => biz.id === b.id) ||
                              null,
                          )
                        }
                        className="p-2 md:p-3 hover:bg-kite-blue/5 cursor-pointer transition-colors flex justify-between items-center group"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-medium text-[13px] md:text-[14px] text-kite-text group-hover:text-kite-blue dark:group-hover:text-white truncate flex items-center space-x-1">
                            <span>{b.name?.toUpperCase()}</span>
                          </h4>{""}
                          {activeTab ==="newly-listed" ? (
                            <p className="text-[10px] md:text-[11px] text-kite-text-light mt-0.5 truncate">
                              {b.ownerName}
                            </p>
                          ) : activeTab ==="untapped" ? (
                            <p className="text-[10px] md:text-[11px] text-kite-text-light mt-0.5">
                              {b.interestRate}% Base
                            </p>
                          ) : (
                            <p className="text-[10px] md:text-[11px] text-kite-text-light mt-0.5">
                              {""}
                              {activeTab ==="top-backed"
                                ? `${renderLiveAmount(b)} Invested`
                                : activeTab ==="top-invested"
                                  ? `${b.investorCount} Investors`
                                  : `${b.profitedInvestorsCount} Profited`}{""}
                            </p>
                          )}{""}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {""}
                          {activeTab ==="top-backed" ? (
                            <>
                              <p className="text-[13px] md:text-[14px] font-medium text-kite-blue">
                                {b.investorCount}
                              </p>
                              <p className="text-[10px] md:text-[11px] text-blue-600 uppercase tracking-wider mt-0.5">
                                Investors
                              </p>
                            </>
                          ) : activeTab ==="top-invested" ? (
                            <>
                              <p className="text-[13px] md:text-[14px] font-medium">
                                {renderLiveAmount(b)}
                              </p>
                              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mt-0.5">
                                Capital
                              </p>
                            </>
                          ) : activeTab ==="top-earners" ? (
                            <>
                              <p className="text-[13px] md:text-[14px] font-medium text-kite-green">
                                {formatINR(b.totalRet)}
                              </p>
                              <p className="text-[10px] md:text-[11px] text-kite-green uppercase tracking-wider mt-0.5">
                                Payouts
                              </p>
                            </>
                          ) : activeTab ==="newly-listed" ? (
                            <>
                              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                {b.interestRate}%
                              </p>
                              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mt-0.5">
                                Return
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                0
                              </p>
                              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mt-0.5">
                                Investors
                              </p>
                            </>
                          )}{""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-kite-text-light opacity-50" />
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                        No data available
                      </p>
                      <p className="text-[11px] md:text-[12px] text-kite-text-light text-center">
                        Data will appear here once records are available.
                      </p>
                    </div>
                  )}{""}
                </div>
              </div>
            );
          })()}{""}
        </div>
      )}{""}
      {/* 3. Comprehensive Market Overview Section */}{""}
      {activeTab ==="market-overview" && (
        <div className="bg-white dark:bg-kite-surface border-y border-x-0 md:border-x border-kite-border rounded-none md:rounded-sm overflow-hidden flex flex-col scroll-mt-24">
          <div className="p-1.5 md:p-3 md:p-5 border-b border-kite-border flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
            <div>
              <h3 className="font-medium text-kite-text flex items-center space-x-2 text-[11px] md:text-[12px]">
                <Info className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />
                <span>Comprehensive Market Overview</span>
              </h3>
              <p className="text-[11px] md:text-[12px] text-kite-text-light mt-1">
                {""}
                Complete list of all listed businesses structured for
                professional analysis.{""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search business or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-kite-border rounded-sm text-[13px] md:text-[14px] text-kite-text bg-kite-bg w-full md:w-64 focus:outline-none focus:border-kite-blue"
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as"investment" |"interest")
                }
                className="px-3 py-2 border border-kite-border rounded-sm text-[13px] md:text-[14px] text-kite-text bg-kite-bg w-full sm:w-auto focus:outline-none focus:border-kite-blue cursor-pointer"
              >
                <option value="interest">Sort by Interest Rate</option>
                <option value="investment">Sort by Total Investment</option>
              </select>
            </div>
          </div>
          <div className="overflow-hidden">
            {""}
            {/* Desktop Table */}{""}
            <div className="hidden md:block overflow-x-auto w-full max-w-full">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-kite-bg border-b border-kite-border text-[10px] md:text-[11px] uppercase tracking-wider text-kite-text-light">
                    <th className="p-2 md:p-2 md:p-4 font-medium">Business</th>
                    <th className="p-2 md:p-2 md:p-4 font-medium">
                      Base Interest
                    </th>
                    <th className="p-2 md:p-2 md:p-4 font-medium text-right">
                      Total Invested
                    </th>
                    <th className="p-2 md:p-2 md:p-4 font-medium text-right">
                      Total Payouts
                    </th>
                    <th className="p-2 md:p-2 md:p-4 font-medium text-center">
                      Active Investors
                    </th>
                    <th className="p-2 md:p-2 md:p-4 font-medium text-center">
                      Live Trend
                    </th>
                    <th className="p-2 md:p-2 md:p-4 font-medium text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kite-border">
                  {""}
                  {overviewBusinesses.map((b) => (
                    <tr
                      key={`all_desk_${b.id}`}
                      onClick={() =>
                        setSelectedBusiness(
                          state.businesses.find((biz) => biz.id === b.id) ||
                            null,
                        )
                      }
                      className="hover:bg-kite-blue/10 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-kite-blue shadow-none text-white flex-shrink-0 font-sans font-medium flex items-center justify-center text-[13px] md:text-[14px]">
                            {""}
                            {b.name?.trim().charAt(0).toUpperCase() ||"B"}{""}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <p className="font-normal text-[13px] md:text-[14px] text-kite-text group-hover:text-kite-blue dark:group-hover:text-white truncate">
                                {b.name?.toUpperCase()}
                              </p>{""}
                              {statsMap.get(b.id)?.isBlueTick && (
                                <BadgeCheck
                                  className="w-3 md:w-3.5 h-3 md:h-3.5 text-white fill-blue-500 flex-shrink-0"
                                  title="RMAS Verified"
                                />
                              )}{""}
                              {statsMap.get(b.id)?.isPreVerified && (
                                <Clock
                                  className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text flex-shrink-0"
                                  title="Pre-Verified"
                                />
                              )}{""}
                            </div>
                            <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wide mt-0.5">
                              {b.ownerName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 text-[10px] md:text-[11px] font-medium rounded-sm ${b.interestRate <= 10 ?"bg-kite-blue/10 text-kite-blue" : b.interestRate <= 20 ?"bg-white dark:bg-kite-surface text-kite-text" :"bg-kite-red/10 text-kite-red"}`}
                        >
                          {""}
                          {b.interestRate}%{""}
                        </span>
                      </td>
                      <td className="p-2 md:p-2 md:p-4 text-right">
                        <p className="font-medium text-[13px] md:text-[14px] text-kite-text">
                          {renderLiveAmount(b)}
                        </p>
                      </td>
                      <td className="p-2 md:p-2 md:p-4 text-right">
                        <p
                          className={`font-medium text-[13px] md:text-[14px] ${b.totalRet > 0 ?"text-kite-green" :"text-kite-text-light"}`}
                        >
                          {""}
                          {b.totalRet > 0 ? formatINR(b.totalRet) :"-"}{""}
                        </p>
                      </td>
                      <td className="p-2 md:p-2 md:p-4 text-center">
                        <div className="flex justify-center items-center space-x-1">
                          <Users className="w-3 md:w-3.5 h-3 md:h-3.5 text-kite-text-light" />
                          <span className="font-medium text-kite-text text-[13px] md:text-[14px]">
                            {b.investorCount}
                          </span>
                        </div>{""}
                        {b.profitedInvestorsCount > 0 && (
                          <p className="text-[10px] md:text-[11px] text-kite-green mt-0.5 font-medium">
                            {b.profitedInvestorsCount} Profited
                          </p>
                        )}{""}
                      </td>
                      <td className="p-2 md:p-2 md:p-4 text-center">
                        <div className="flex justify-center text-[13px] md:text-[14px]">
                          <MarketTrendCell businessId={b.id} showIcon={true} />
                        </div>
                      </td>
                      <td className="p-2 md:p-2 md:p-4 text-center">
                        {""}
                        {b.totalInv === 0 ? (
                          <span className="inline-block px-2 py-1 bg-kite-bg text-kite-text-light text-[10px] md:text-[11px] font-medium uppercase rounded-sm tracking-wide">
                            Untapped
                          </span>
                        ) : b.totalRet > 0 ? (
                          <span className="inline-block px-2 py-1 bg-kite-green/20 text-kite-green text-[10px] md:text-[11px] font-medium uppercase rounded-sm tracking-wide flex items-center justify-center space-x-1 w-max mx-auto">
                            <BadgeCheck className="w-[10px] h-[10px]" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-kite-blue/10 text-kite-blue text-[10px] md:text-[11px] font-medium uppercase rounded-sm tracking-wide">
                            Active
                          </span>
                        )}{""}
                      </td>
                    </tr>
                  ))}{""}
                </tbody>
              </table>
            </div>{""}
            {/* Mobile Cards View */}{""}
            <div className="block md:hidden divide-y divide-kite-border/50">
              {""}
              {overviewBusinesses.map((b) => (
                <div
                  key={`all_mob_${b.id}`}
                  onClick={() =>
                    setSelectedBusiness(
                      state.businesses.find((biz) => biz.id === b.id) || null,
                    )
                  }
                  className="p-2 hover:bg-kite-bg active:bg-kite-bg transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-full bg-kite-blue shadow-none text-white flex-shrink-0 font-sans font-medium flex items-center justify-center text-[10px] md:text-[11px]">
                        {""}
                        {b.name?.trim().charAt(0).toUpperCase() ||"B"}{""}
                      </div>
                      <p className="font-normal text-[13px] md:text-[14px] text-kite-text truncate">
                        {b.name?.toUpperCase()}
                      </p>{""}
                      {statsMap.get(b.id)?.isBlueTick && (
                        <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0" />
                      )}{""}
                      {statsMap.get(b.id)?.isPreVerified && (
                        <Clock className="w-3.5 h-3.5 text-kite-text flex-shrink-0" />
                      )}{""}
                    </div>
                    <div className="text-right flex-shrink-0 font-medium text-[13px] md:text-[14px] text-kite-text">
                      {""}
                      {renderLiveAmount(b)}{""}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider truncate max-w-[100px]">
                        {b.ownerName}
                      </p>{""}
                      {b.investorCount > 0 && (
                        <span className="text-[10px] md:text-[11px] text-kite-text-light border-l border-kite-border pl-2">
                          {b.investorCount} inv
                        </span>
                      )}{""}
                    </div>
                    <div className="text-right flex items-center space-x-2 flex-shrink-0">
                      <span
                        className={`text-[10px] md:text-[11px] font-medium ${b.interestRate <= 10 ?"text-kite-blue" : b.interestRate <= 20 ?"text-kite-text" :"text-kite-red"}`}
                      >
                        {b.interestRate}% Int.
                      </span>
                      <div className="text-[11px] md:text-[12px] min-w-[40px] text-right">
                        <MarketTrendCell businessId={b.id} showIcon={false} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}{""}
            </div>{""}
            {overviewBusinesses.length === 0 && (
              <div className="p-8 flex flex-col items-center justify-center space-y-3 border-t border-kite-border">
                <AlertCircle className="w-8 h-8 text-kite-text-light opacity-50" />
                <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                  No businesses found
                </p>
                <p className="text-[11px] md:text-[12px] text-kite-text-light text-center">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}{""}
          </div>
        </div>
      )}{""}
      {selectedBusiness && renderBusinessDetails(selectedBusiness)}{""}
    </div>
  );
}
