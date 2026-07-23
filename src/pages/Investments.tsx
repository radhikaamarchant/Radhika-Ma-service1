import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from"react";
import { useAppContext } from"../utils/AppContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import AddInvestmentModal from "../components/AddInvestmentModal";
import { formatINR } from"../utils/mockData";
import { getCurrentMarketPrice } from "../utils/marketSimulator";
import {
  Plus,
  ReceiptIndianRupee,
  Search,
  X,
  CheckCircle,
  Wallet,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Calculator,
  MoreVertical,
  Minus,
  RefreshCw,
} from "lucide-react";
import { Investment, Business, Investor } from"../types";
import { getBlueTickBusinessIds } from"../utils/blueTick";
import { getBaseMarketTrend } from"../utils/marketSimulator";
import { useMarketSimulation } from"../utils/MarketSimulationContext";
import { calculateLiveProfit as globalCalculateLiveProfit } from"../utils/profitCalculator";
import { motion, AnimatePresence } from"motion/react";
import { MobilePortfolioSummary } from"../components/MobilePortfolioSummary";
import { SwipeButton } from"../components/SwipeButton";

export function formatCompactINR(number: number): string {
  if (number >= 10000000) {
    return '₹' + (number / 10000000).toFixed(1).replace(/\.0$/, '') + 'CR';
  }
  if (number >= 100000) {
    return '₹' + (number / 100000).toFixed(1).replace(/\.0$/, '') + 'LK';
  }
  if (number >= 1000) {
    return '₹' + (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return '₹' + number.toString();
}

export default function Investments() {

  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const checkPending = () => {
      const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
      if (pendingId) {
        setAddModalBusinessId(pendingId);
        
        const b = state.businesses.find(biz => biz.id === pendingId);
        const isTrigger = b?.investmentType === 'trigger';
        const amount = isTrigger && b?.triggerAmount 
          ? new Intl.NumberFormat("en-IN").format(getCurrentMarketPrice(b, state.investments)) 
          : b?.fundingRequired ? b.fundingRequired.toLocaleString("en-IN") : "";
          
        setFormData((prev: any) => ({ ...prev, businessId: pendingId, amount }));
        setShowAddForm(true);
        setIsFromAnalysis(true);
        setShowInvestorSelect(false); // Make sure it's false to show the new investment form directly
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
      }
    };
    
    // Clear storage on initial mount if it was used for initial state
    if (sessionStorage.getItem("mobileAddInvestmentBusinessId")) {
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
    }
    
    window.addEventListener("mobileNavigateToInvestments", checkPending);
    return () => window.removeEventListener("mobileNavigateToInvestments", checkPending);
  }, []);

  const { marketState } = useMarketSimulation();
  const blueTickBusinessIds = getBlueTickBusinessIds(
    state.businesses,
    state.investments,
  );
  const [showAddForm, setShowAddForm] = useState(() => !!sessionStorage.getItem("mobileAddInvestmentBusinessId"));
  const [addModalBusinessId, setAddModalBusinessId] = useState(() => sessionStorage.getItem("mobileAddInvestmentBusinessId") || "");
  const [addModalInvestorId, setAddModalInvestorId] = useState("");
  const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");
  const [inputMode, setInputMode] = useState<"AMOUNT" | "QTY">("AMOUNT");
  const [isBuyFlow, setIsBuyFlow] = useState(false);
  const [showTradeOptions, setShowTradeOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"holding" | "booked">("holding");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(
    null,
  );
  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<string[]>(
    [],
  );
  const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(0);
  const confirmWithdrawRef = useRef<() => void>();
  // Scroll preservation
  const dragRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      const isList = !showAddForm && !selectedInvestment;
      if (isList) {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [showAddForm, selectedInvestment]);

  useLayoutEffect(() => {
    const isList = !showAddForm && !selectedInvestment;
    if (isList) {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [showAddForm, selectedInvestment]);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      handleResize();
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  const [withdrawFormData, setWithdrawFormData] = useState({
    completedMonths:"12",
    rmasCommission:"",
    happyIncomeTax:"",
  });
  const [isFromAnalysis, setIsFromAnalysis] = useState(() => !!sessionStorage.getItem("mobileAddInvestmentBusinessId"));
  const [showBusinessSelect, setShowBusinessSelect] = useState(false);
  const [desktopShowBusinessSelect, setDesktopShowBusinessSelect] = useState(false);
  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] = useState(false);
  


  const [showInvestorSelect, setShowInvestorSelect] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState<{
    businessName: string;
    investorName: string;
    amount: number;
    type?: "BUY" | "SELL";
  } | null>(null);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [payoutFreq, setPayoutFreq] = useState("Monthly");
  const [expectedRoi, setExpectedRoi] = useState("10.5");
  const [showBrokerageROI, setShowBrokerageROI] = useState(false);
  const [shakeQuantity, setShakeQuantity] = useState(false);
  const [formData, setFormData] = useState(() => ({
    businessId: sessionStorage.getItem("mobileAddInvestmentBusinessId") || "",
    investorId:"",
    amount:"",
    quantity: 1,
    timePeriodMonths:"12",
    adminCommissionInvestorPct:"2",
    adminCommissionBusinessPct:"2",
  }));
  const selectedBusiness = state.businesses.find(
    (b) => b.id === formData.businessId,
  );
  const selectedInvestor = state.investors.find(
    (i) => i.id === formData.investorId,
  );
  const selectedBusinessInterest = selectedBusiness
    ? selectedBusiness.interestRate
    : 0;
  const getRawAmount = (formattedValue: string) => {
    return parseFloat(formattedValue.replace(/,/g,"")) || 0;
  };
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g,"");
    const formatted = raw ? Number(raw).toLocaleString("en-IN") :"";
    setFormData({ ...formData, amount: formatted });
  };
  const calculateCommissions = () => {
    const amount = getRawAmount(formData.amount);
    const invPct = parseFloat(formData.adminCommissionInvestorPct) || 0;
    const busPct = parseFloat(formData.adminCommissionBusinessPct) || 0;
    const fromInvestor = (amount * invPct) / 100;
    const fromBusiness = (amount * busPct) / 100;
    const netInvestment = amount - fromInvestor;
    return {
      fromInvestor,
      fromBusiness,
      investorNTSC: fromInvestor,
      businessNTSC: fromBusiness,
      netInvestment,
      totalAdmin: fromInvestor + fromBusiness,
    };
  };
  useKeyboardShortcuts({
    'enter': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isBooking && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift+enter': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isBooking && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    },
    'shift': (e) => {
      if (withdrawStep === 1 && confirmWithdrawRef.current) {
        e.preventDefault();
        confirmWithdrawRef.current();
        return;
      }
      if (showAddForm && !isBooking && formData.businessId && formData.investorId) {
        e.preventDefault();
        handleAddSubmit(e as any);
      }
    }
  }, showAddForm || withdrawStep === 1);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !formData.investorId) {
      alert("Please select both a business and an investor.");
      return;
    }
    const amount = getRawAmount(formData.amount);
    if (amount <= 0) return;
    const comms = calculateCommissions();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(formData.timePeriodMonths));
    const newInvestment: Investment = {
      id: `inv${Date.now()}`,
      businessId: formData.businessId,
      investorId: formData.investorId,
      amount: amount,
      quantity: formData.quantity,
      timePeriodMonths: parseInt(formData.timePeriodMonths),
      interestRate: selectedBusinessInterest,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      adminCommissionInvestor: comms.fromInvestor,
      adminCommissionBusiness: comms.fromBusiness,
      status:"active",
    };
    setIsBooking(true);
    setTimeout(() => {
      dispatch({ type:"ADD_INVESTMENT", payload: newInvestment });
      if (amount >= selectedBusiness.fundingRequired) {
        dispatch({
          type:"UPDATE_BUSINESS_STATUS",
          payload: { id: formData.businessId, status:"funded" },
        });
      }
      setSuccessData({
        businessName: selectedBusiness.shortName ? selectedBusiness.shortName.toUpperCase() : selectedBusiness.name,
        investorName: selectedInvestor
          ? selectedInvestor.name
          :"Unknown Investor",
        amount: amount,
      });
      setIsBooking(false);
      setShowSuccessAnimation(true);
      setShowAddForm(false);
      setIsBuyFlow(false);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSuccessData(null);
        setFormData({
          businessId:"",
          investorId:"",
          amount:"",
          timePeriodMonths:"12",
          adminCommissionInvestorPct:"2",
          adminCommissionBusinessPct:"2",
        });
      }, 3000);
    }, 600);
  };
  const getTime = (id: string) => parseInt(id.replace(/\D/g,"")) || 0;
  const getActiveInvestmentCount = (investorId: string) => {
    if (!formData.businessId) return 0;
    return state.investments.filter(
      (i) =>
        i.investorId === investorId &&
        i.businessId === formData.businessId &&
        i.status ==="active",
    ).length;
  };
  const [isBooking, setIsBooking] = useState(false);


  useMobileBackNavigation(showBusinessSelect, () => setShowBusinessSelect(false));
  useMobileBackNavigation(showInvestorSelect, () => setShowInvestorSelect(false));
  useMobileBackNavigation(!!selectedInvestment, () => setSelectedInvestment(null));
  const uniqueInvestments = useMemo(() => Array.from(
    new Map<string, Investment>(
      state.investments.map((inv) => [inv.id, inv]),
    ).values(),
  ), [state.investments]);
  const allGroupedInvestments = useMemo(() => Object.values(
    uniqueInvestments.reduce(
      (acc, inv) => {
        const key = `${inv.businessId}_${inv.investorId}_${inv.status}`;
        if (!acc[key]) {
          acc[key] = {
            ...inv,
            key: key,
            groupedIds: [inv.id],
            isGrouped: true,
            groupedInvestmentsList: [inv],
          };
        } else {
          acc[key].amount += inv.amount;
          acc[key].groupedIds.push(inv.id);
          acc[key].groupedInvestmentsList.push(inv);
        }
        return acc;
      },
      {} as Record<string, any>,
    ),
  ), [uniqueInvestments]);
  const holdingGroupedCount = useMemo(() => allGroupedInvestments.filter(
    (inv: any) => inv.status ==="active",
  ).length, [allGroupedInvestments]);
  // Dynamic position count: Count only grouped investments currently in profit
  const positionsGroupedCount = useMemo(() => allGroupedInvestments.filter((inv: any) => {
    if (inv.status ==="completed") {
      const actualProfit = inv.payoutDetails
        ? inv.payoutDetails.totalCredited +
          (inv.payoutDetails.rmasCommission || 0) +
          (inv.payoutDetails.happyIncomeTax || 0) -
          inv.amount
        : 0;
      return actualProfit > 0;
    }
    const { liveProfit } = globalCalculateLiveProfit(
      inv.groupedInvestmentsList,
      inv.businessId,
      marketState.trends,
      state.settings,
    );
    return liveProfit > 0;
  }).length, [allGroupedInvestments, marketState.trends, state.settings]);
  const groupedInvestments = useMemo(() => allGroupedInvestments
    .filter((inv) => {
      const business = state.businesses.find((b) => b.id === inv.businessId);
      const investor = state.investors.find((i) => i.id === inv.investorId);
      const match = searchTerm.toLowerCase();
      const searchMatch =
        (business?.shortName ? business.shortName.toLowerCase().includes(match) : business?.name.toLowerCase().includes(match)) ||
        investor?.name.toLowerCase().includes(match);
      const tabMatch =
        activeTab ==="holding"
          ? inv.status ==="active"
          : inv.status ==="completed";
      return searchMatch && tabMatch;
    })
    .sort((a, b) => getTime(b.id) - getTime(a.id)), [allGroupedInvestments, state.businesses, state.investors, searchTerm, activeTab]);
  const activeBusinesses = useMemo(() => state.businesses
    .slice()
    .sort((a, b) => getTime(b.id) - getTime(a.id)), [state.businesses]);
  const sortedInvestors = useMemo(() => state.investors
    .slice()
    .sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime()), [state.investors]);
  const renderedList = useMemo(() => {
    return (
      <>
        <div className="flex flex-col pb-0">
          {""}
          {groupedInvestments.map((inv, idx) => {
            const business = state.businesses.find(
              (b) => b.id === inv.businessId,
            );
            const investor = state.investors.find(
              (i) => i.id === inv.investorId,
            );
            const overallTrend = marketState.trends[inv.businessId] || 0;
            const isCompleted = inv.status ==="completed";
            const actualProfit =
              isCompleted && inv.payoutDetails
                ? inv.payoutDetails.totalCredited +
                  (inv.payoutDetails.rmasCommission || 0) +
                  (inv.payoutDetails.happyIncomeTax || 0) -
                  inv.amount
                : 0;
            let liveProf = 0;
            let currentVal = inv.amount;
            if (!isCompleted) {
              const { liveProfit, currentValue } = globalCalculateLiveProfit(
                [inv],
                inv.businessId,
                marketState.trends,
                state.settings,
              );
              liveProf = liveProfit;
              currentVal = currentValue;
            }
            const holdingProfit = isCompleted ? actualProfit : liveProf;
            const curValue = isCompleted
              ? inv.amount + holdingProfit
              : currentVal;
            const pnlPercentage = isCompleted
              ? (holdingProfit / inv.amount) * 100
              : overallTrend;
            const isProfit = holdingProfit >= 0;
            // Quantities & Averages
            const qty = inv.groupedInvestmentsList.reduce((sum, item) => sum + (item.quantity || 1), 0);
            const avgPrice = inv.amount / qty;
            const currentLTP = curValue / qty;
            const isOverallTrendPositive = overallTrend >= 0;
            
            return (
              <div
                key={`grouped_${inv.key}_${idx}`}
                className="w-full flex flex-col md:flex-row md:items-stretch px-4 py-3 md:py-0 hover:bg-gray-50 dark:md:hover:bg-[#131415] border-b border-kite-border-soft transition-colors cursor-pointer group font-sans outline-none focus:outline-none focus:ring-0 focus:bg-transparent dark:focus:bg-[#202020] active:outline-none"
                onClick={() => {
                  setSelectedInvestment(inv);
                  setSelectedInvestmentIds(
                    inv.groupedInvestmentsList.map((i) => i.id),
                  );
                  setWithdrawStep(0);
                }}
              >
                {/* MOBILE VIEW */}
                <div className="md:hidden flex flex-col w-full">
                  {/* Line 1: Metrics Row (Qty & Avg) */}
                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                    <div className="flex items-center text-[11px] md:text-[12px]">
                       <span className="text-kite-text-light font-normal mr-1">Qty.</span>
                       <span className="text-kite-text font-normal tracking-wide">{qty}</span>
                       <span className="text-kite-text-light mx-1.5">•</span>
                       <span className="text-kite-text-light font-normal mr-1">Avg.</span>
                       <span className="text-kite-text font-normal tracking-wide">{formatINR(avgPrice).replace("₹", "")}</span>
                    </div>
                    <div className={`text-[11px] md:text-[12px] font-normal ${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                      {isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                  {/* Line 2: Core Business Name & Absolute P&L Row */}
                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                     <div className="flex items-center gap-1.5">
                        <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                           {business?.shortName ? business.shortName.toUpperCase() : (business?.name?.toUpperCase() || "UNKNOWN BUSINESS")}
                        </h3>
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck
                            className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0"
                            title="RMAS Verified"
                          />
                        )}
                     </div>
                     <div className={`text-[13px] md:text-[14px] font-normal ${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                       {isProfit && holdingProfit >= 0 ? "+" : ""}
                       {formatINR(holdingProfit).replace("₹", "")}
                     </div>
                  </div>
                  {/* Line 3: Footer Row (Investor Info & LTP) */}
                  <div className="flex justify-between items-center leading-tight">
                     <div className="flex items-center text-[10px] md:text-[11px]">
                       <span className="text-kite-text-light font-normal mr-1">Investor:</span>
                       <span className="text-kite-text font-normal uppercase tracking-wide">{investor?.name?.toUpperCase()}</span>
                     </div>
                     <div className="flex items-center text-[11px] md:text-[12px]">
                       <span className="text-kite-text-light font-normal mr-1">LTP</span>
                       <span className="text-kite-text font-normal tracking-wide">{formatINR(currentLTP).replace("₹", "")}</span>
                     </div>
                  </div>
                </div>
                {/* DESKTOP VIEW */}
                <div className="hidden md:flex flex-row items-stretch justify-between w-full text-[13px]">
                   <div className="w-4/12 flex flex-col gap-[2px] justify-center py-3">
                      <div className="flex items-center gap-1.5 text-kite-text font-normal text-[13px] leading-[18px] uppercase tracking-wide desktop-business-name">
                        {business?.shortName ? business.shortName.toUpperCase() : (business?.name?.toUpperCase() || "UNKNOWN BUSINESS")}
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0" title="RMAS Verified" />
                        )}
                      </div>
                      <span className="text-kite-text-light font-normal text-[12px] leading-[18px] uppercase tracking-wide desktop-investor-name">
                        {investor?.name?.toUpperCase()}
                      </span>
                   </div>
                   <div className="w-1/12 text-right text-kite-text-light flex flex-col justify-center py-3">{qty}</div>
                   <div className="w-2/12 text-right text-kite-text-light flex flex-col justify-center py-3">{formatINR(avgPrice).replace("₹", "")}</div>
                   <div className="w-2/12 text-right text-kite-text-light pr-5 flex flex-col justify-center py-3">{formatINR(curValue).replace("₹", "")}</div>
                   <div className={`w-2/12 text-right font-normal text-[12px] leading-[16px] desktop-pnl pl-5 border-l border-kite-vertical-divider flex flex-col justify-center py-3 ${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                      <div className="block">{isProfit && holdingProfit >= 0 ? "+" : ""}{formatINR(holdingProfit).replace("₹", "")}</div>
                   </div>
                   <div className={`w-1/12 text-right font-normal text-[12px] leading-[16px] desktop-net-chg flex flex-col justify-center py-3 ${isProfit ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                      <div className="block">{isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%</div>
                   </div>
                </div>
              </div>
            );
          })}
          {""}
          {groupedInvestments.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              {""}
              <p className="text-kite-text-muted text-[13px] md:text-[14px] font-light">
                {""}
                No investments found.
                {""}
              </p>
              {""}
            </div>
          )}
          {""}
        </div>
        {""}
        {/* Sticky Bottom Summary Bar */}
        {""}
        {groupedInvestments.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:relative bg-kite-surface border-t border-kite-border px-4 py-3 flex justify-between items-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] z-30">
            {""}
            <span className="text-[11px] md:text-[12px] font-medium text-kite-text-light tracking-wide">
              {""}
              Day's P&L
              {""}
            </span>
            {""}
            {(() => {
              const totalInvested = groupedInvestments.reduce(
                (sum, inv) => sum + inv.amount,
                0,
              );
              const totalLiveProfit = groupedInvestments.reduce((sum, inv) => {
                const isCompleted = inv.status ==="completed";
                if (isCompleted) {
                  return (
                    sum +
                    (inv.payoutDetails
                      ? inv.payoutDetails.totalCredited +
                        (inv.payoutDetails.rmasCommission || 0) +
                        (inv.payoutDetails.happyIncomeTax || 0) -
                        inv.amount
                      : 0)
                  );
                }
                return (
                  sum +
                  globalCalculateLiveProfit(
                    [inv],
                    inv.businessId,
                    marketState.trends,
                    state.settings,
                  ).liveProfit
                );
              }, 0);
              const totalPnlPercentage =
                totalInvested > 0 ? (totalLiveProfit / totalInvested) * 100 : 0;
              const isTotalProfit = totalLiveProfit >= 0;
              return (
                <div className="flex items-center gap-2">
                  {""}
                  <span
                    className={`text-[13px] md:text-[14px] font-normal ${isTotalProfit ?"text-[#4CAF50] dark:text-[#5B9A5D]" :"text-[#DF514C] dark:text-[#E25F5B]"}`}
                   
                  >
                    {""}
                    {isTotalProfit && totalLiveProfit > 0 ?"+" :""}
                    {""}
                    {formatINR(totalLiveProfit)}
                    {""}
                  </span>
                  {""}
                  <span
                    className={`text-[11px] md:text-[12px] font-normal ${isTotalProfit ?"text-[#4CAF50] dark:text-[#5B9A5D]" :"text-[#DF514C] dark:text-[#E25F5B]"}`}
                  >
                    {""}
                    {isTotalProfit ?"+" :""} {totalPnlPercentage.toFixed(2)}
                    %
                    {""}
                  </span>
                  {""}
                </div>
              );
            })()}
            {""}
          </div>
        )}
      </>
    );
  }, [groupedInvestments, state.businesses, state.investors, marketState.trends, state.settings, blueTickBusinessIds]);

  return (
    <div className="w-full flex flex-col font-sans bg-kite-surface dark:bg-transparent dark:md:bg-[#181818]">
      {""}
      <div
        className={`flex flex-col w-full bg-kite-surface dark:bg-transparent dark:md:bg-[#181818] pt-2 border-b border-kite-border ${showAddForm ?"hidden md:flex" :"flex"}`}
      >
        {""}
        {/* Full width tabs */}{""}
        <div className="flex w-full w-full px-4 gap-6">
          {""}
          <button
            onClick={() => setActiveTab("holding")}
            className={`h-[44px] flex items-center justify-center relative transition-colors ${activeTab ==="holding" ?"text-[#387ED1] font-medium" :"text-kite-text font-medium opacity-80"}`}
          >
            {""}
            <span className="text-[15px] md:text-[16px]">Holdings</span>{""}
            {activeTab ==="holding" && (
              <motion.div
                layoutId="investments-tab-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#387ED1]"
              />
            )}{""}
          </button>{""}
          <button
            onClick={() => setActiveTab("booked")}
            className={`h-[44px] flex items-center justify-center relative transition-colors ${activeTab ==="booked" ?"text-[#387ED1] font-medium" :"text-kite-text font-medium opacity-80"}`}
          >
            {""}
            <span className="text-[15px] md:text-[16px]">Positions</span>{""}
            {activeTab ==="booked" && (
              <motion.div
                layoutId="investments-tab-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#387ED1]"
              />
            )}{""}
          </button>{""}
        </div>{""}
      </div>{""}
      <div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg dark:md:bg-[#181818] shadow-sm w-full">
<div
        className={`flex items-center justify-between w-full py-3 px-4 w-full ${showAddForm ?"hidden md:flex" :"flex"}`}
      >
        {""}
        {!isSearchExpanded && (
          <button
            onClick={() => {
              if (!showAddForm) {
                setFormData({ businessId: "", investorId: "", amount: "", timePeriodMonths: "12", adminCommissionInvestorPct: "2", adminCommissionBusinessPct: "2" });
                setAddModalBusinessId("");
                setAddModalInvestorId("");
                setIsFromAnalysis(false);
              }
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-kite-blue text-white rounded font-medium text-[13px] md:text-[14px] hover:bg-blue-600 transition-colors shadow-sm"
          >
            {""}
            <Plus className="w-4 h-4" /> <span>Add</span>{""}
          </button>
        )}
        <div className={`flex items-center justify-end h-[36px] ${isSearchExpanded ? 'w-full' : 'w-auto'}`}>
          {!isSearchExpanded ? (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-1 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
            >
              <Search className="w-[18px] h-[18px] text-kite-blue" />
            </button>
          ) : (
            <div className="flex items-center w-full md:w-[250px] transition-all duration-300 bg-kite-surface md:bg-gray-100 md:dark:bg-transparent rounded-sm h-[36px]">
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchTerm("");
                }}
                className="p-2 -ml-2 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full mr-1 transition-colors flex-shrink-0 flex items-center justify-center"
              >
                <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Eg: RMAS,SARITA.."
                className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-2 text-gray-600 hover:text-kite-text transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>{""}
      </div>{""}
      
{/* DESKTOP HEADER */}
          <div className="hidden md:flex flex-row items-stretch justify-between w-full px-4 text-[11px] text-kite-text-light tracking-wide font-normal bg-kite-surface border-b border-kite-border-soft">
             <div className="w-4/12 text-left py-2">Instrument</div>
             <div className="w-1/12 text-right py-2">Qty.</div>
             <div className="w-2/12 text-right py-2">Avg. cost</div>
             <div className="w-2/12 text-right py-2 pr-5">Cur. val</div>
             <div className="w-2/12 text-right py-2 pl-5 border-l border-kite-vertical-divider">P&L</div>
             <div className="w-1/12 text-right py-2">Net chg.</div>
          </div>
</div>
<AnimatePresence>
        {""}
        {showAddForm && (
          <motion.div
            key="mobile-add-form"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="md:hidden fixed top-0 left-0 right-0 z-[110] bg-white dark:bg-kite-bg dark:md:bg-[#181818] flex flex-col font-sans"
            style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
          >
            {/* Header */}
            <div className="flex flex-col bg-[#F3F4F6] dark:bg-kite-bg dark:md:bg-[#181818] shrink-0 z-10 mobile-header-safe pt-2">
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => { setShowAddForm(false); setIsFromAnalysis(false); }}
                  className="text-gray-700 dark:text-[#F1F5F9] -ml-2 p-1 mr-3 flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <div className="flex-1 mt-0.5">
                  <h2 className="text-[20px] font-normal text-gray-900 dark:text-[#F1F5F9] leading-tight tracking-wide">
                    {selectedBusiness ? (selectedBusiness.shortName || selectedBusiness.name).toUpperCase() : "NEW INVESTMENT"}
                  </h2>
                </div>
              </div>

              {selectedBusiness && (
                <div className="px-4 pb-4">
                  <div className="flex items-center px-4 py-1.5 bg-white dark:bg-[#2B3648] overflow-x-auto hide-scrollbar">
                    <div className="flex items-center space-x-5 text-[13px] whitespace-nowrap">
                      {selectedBusiness.investmentType === 'trigger' && selectedBusiness.triggerAmount && (
                        <span className="text-gray-500 dark:text-[#A3ACB8] font-normal">LTP <span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">₹{getCurrentMarketPrice(selectedBusiness, state.investments).toFixed(2)}</span></span>
                      )}
                      <span className="text-gray-500 dark:text-[#A3ACB8] font-normal">FND <span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(selectedBusiness.fundingRequired || 0)}</span></span>
                      <span className="text-gray-500 dark:text-[#A3ACB8] font-normal">INC <span className="font-light text-[#444444] dark:text-[#F1F5F9] ml-1">{formatCompactINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))}</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Business & Investor Select */}
            <div className="bg-white dark:bg-kite-bg dark:md:bg-[#181818] shrink-0 z-20">
                <div className="bg-white dark:bg-transparent dark:md:bg-[#181818] relative">
                  {/* Business & Investor Select */}
                  <div className="flex flex-col">
                     {!isFromAnalysis && (
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10" onClick={() => setShowBusinessSelect(true)}>
                        <p className="text-[11px] text-[#7A7A7A] dark:text-[#A3ACB8] font-normal mb-1 uppercase tracking-wider">Business</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[15px] font-light text-[#444444] dark:text-[#F1F5F9] truncate pr-2">
                            {selectedBusiness ? selectedBusiness.name.toUpperCase() : "Select Business"}
                          </p>
                          <ChevronDown className="w-4 h-4 text-[#4184F3]" />
                        </div>
                     </div>
                     )}
                     {/* Investor Select Trigger & Expansion */}
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] relative z-20">
                        <div className="p-4 cursor-pointer" onClick={() => setShowInvestorSelect(!showInvestorSelect)}>
                          <p className="text-[11px] text-[#7A7A7A] dark:text-[#A3ACB8] font-normal mb-1 uppercase tracking-wider">Investor</p>
                          <div className="flex justify-between items-center">
                            <p className="text-[15px] font-normal text-[#444444] dark:text-[#F1F5F9] truncate pr-2">
                              {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}
                            </p>
                            <ChevronDown className={`w-4 h-4 text-[#4184F3] transition-transform ${showInvestorSelect ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {showInvestorSelect && (
                            <div
                               className="w-full overflow-hidden bg-[#F3F4F6] dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] origin-top"
                               style={{ animation: '0.1s ease-out forwards slideDown' }}
                            >
                               <div className="p-3 border-b border-gray-200 dark:border-[#44546A]">
                                 <div className="relative">
                                   <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-[#A3ACB8]" />
                                   <input
                                     type="text" autoFocus placeholder="Search investors or ID..."
                                     className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-[#44546A] rounded-[4px] text-[14px] font-normal text-[#444444] dark:text-[#F1F5F9] outline-none focus:border-[#4184F3] focus:ring-1 focus:ring-[#4184F3]/20 transition-all"
                                     value={investorSearch} onChange={(e) => setInvestorSearch(e.target.value)}
                                   />
                                 </div>
                               </div>
                               <div className="overflow-y-auto hide-scrollbar pb-4" style={{ maxHeight: viewportHeight ? `${viewportHeight - 160}px` : 'calc(100dvh - 200px)' }}>
                                 {sortedInvestors
                                   .filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(investorSearch.toLowerCase()))
                                   .map((i, idx) => {
                                      const activeCount = selectedBusiness ? state.investments.filter(inv => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;
                                      return (
                                      <div
                                        key={`mob_sel_inv_in_${i.id}_${idx}`}
                                        className="px-4 py-3 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-[#39475B] active:bg-gray-100 dark:active:bg-[#39475B]"
                                        onClick={() => {
                                          setFormData({ ...formData, investorId: i.id });
                                          setShowInvestorSelect(false);
                                          setInvestorSearch("");
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          {i.photoUrl ? (
                                            <img src={i.photoUrl} alt={i.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-[#44546A]" />
                                          ) : (
                                            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[#1E3A5F] flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-[14px] shrink-0 border border-blue-100 dark:border-blue-800">
                                              {i.name.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <div>
                                            <span className="font-normal text-[13px] text-[#444444] dark:text-[#F1F5F9] uppercase">{i.name}</span>
                                            <span className="text-[11px] text-gray-500 dark:text-[#A3ACB8] block mt-0.5">ID: {i.investorId}</span>
                                          </div>
                                        </div>
                                        {activeCount > 0 && (
                                          <div className="bg-[#4184F3] text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                                            {activeCount}
                                          </div>
                                        )}
                                      </div>
                                      );
                                   })}
                                   <div className="h-40 w-full shrink-0" />
                               </div>
                            </div>
                          )}
                     </div>
                  </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white dark:bg-kite-bg dark:md:bg-[#181818]" style={{ paddingBottom: "200px" }}>
                <div className="bg-white dark:bg-transparent dark:md:bg-[#181818] relative">
                  
                  {/* Amount and Quantity */}
                  <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-4">
                     {/* MOBILE VIEW */}
                     <div className="md:hidden w-full border-b border-gray-200 dark:border-[#44546A] pt-4 px-4 pb-4 relative z-10">
                        {selectedBusiness?.investmentType === 'trigger' ? (
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1">
                                <p className="text-[14px] text-gray-800 dark:text-[#E3E3E3] font-semibold">
                                  {inputMode === 'AMOUNT' ? 'Amount' : 'Quantity'}
                                </p>
                                <span className="text-[14px] text-gray-500 dark:text-[#8F8F8F]">
                                  {inputMode === 'AMOUNT' ? `${formData.quantity || 0} Qty.` : `₹${formData.amount || 0}`}
                                </span>
                             </div>
                             <div className="flex items-center border border-gray-200 dark:border-[#44546A] rounded-[4px] overflow-hidden bg-transparent focus-within:border-[#4184F3] transition-colors">
                               <input
                                 type="text"
                                 className="flex-1 bg-transparent px-3 py-3 text-[16px] font-light text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0] min-w-0"
                                 placeholder={inputMode === 'AMOUNT' ? "0" : "1"}
                                 value={inputMode === 'AMOUNT' ? (formData.amount ? `₹${formData.amount}` : "") : formData.quantity}
                                 onChange={(e) => {
                                   const raw = e.target.value.replace(/\D/g, "");
                                   const numericValue = raw ? Number(raw) : 0;
                                   
                                   if (inputMode === "AMOUNT") {
                                     const formatted = raw ? numericValue.toLocaleString("en-IN") : "";
                                     let calculatedQty = formData.quantity;
                                     if (selectedBusiness.triggerAmount) {
                                        calculatedQty = Math.floor(numericValue / getCurrentMarketPrice(selectedBusiness, state.investments));
                                     }
                                     setFormData({ ...formData, amount: formatted, quantity: calculatedQty || 0 });
                                   } else {
                                     let qty: string | number = numericValue;
                                     if (raw === "") qty = "";
                                     let calculatedAmount = formData.amount;
                                     if (selectedBusiness.triggerAmount && raw !== "") {
                                        calculatedAmount = (Number(qty) * getCurrentMarketPrice(selectedBusiness, state.investments)).toLocaleString("en-IN");
                                     }
                                     setFormData({ ...formData, quantity: qty, amount: raw === "" ? "" : calculatedAmount });
                                   }
                                 }}
                               />
                               <div className="flex items-center border-l border-gray-200 dark:border-[#44546A]">
                                 <button 
                                   type="button"
                                   onClick={(e) => {
                                     e.preventDefault();
                                     setInputMode(inputMode === 'AMOUNT' ? 'QTY' : 'AMOUNT');
                                   }}
                                   className="px-4 py-3 hover:bg-gray-50 dark:md:hover:bg-[#131415] text-[#4184F3] transition-colors"
                                 >
                                   <ArrowRightLeft className="w-5 h-5" />
                                 </button>
                               </div>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                             <div className="px-1">
                               <p className="text-[14px] text-[#444444] dark:text-[#E3E3E3] font-light">Amount</p>
                             </div>
                             <div className="flex items-center border border-gray-200 dark:border-[#44546A] rounded-[4px] overflow-hidden bg-transparent focus-within:border-[#4184F3] transition-colors">
                               <input
                                 type="text"
                                 className="w-full bg-transparent px-3 py-3 text-[16px] font-light text-[#444444] dark:text-[#F1F5F9] outline-none placeholder-[#A0A0A0]"
                                 placeholder="₹0"
                                 value={formData.amount ? `₹${formData.amount}` : ""}
                                 onChange={handleAmountChange}
                               />
                             </div>
                          </div>
                        )}
                     </div>

                     {/* DESKTOP VIEW */}
                     <div className="hidden md:block w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 md:p-4 relative z-10 md:flex-1">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Investment Amount</p>
                        <div className="relative">
                          <input
                            type="text"
                            className={`w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500 ${selectedBusiness?.investmentType === 'trigger' ? 'opacity-60 cursor-not-allowed' : ''}`}
                            placeholder="₹0"
                            value={formData.amount ? `₹${formData.amount}` : ""}
                            onChange={handleAmountChange}
                            disabled={selectedBusiness?.investmentType === 'trigger'}
                          />
                        </div>
                     </div>
                     
                     {selectedBusiness?.investmentType === 'trigger' && (
                       <div className="hidden md:block w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 md:p-4 relative z-10 md:flex-1">
                          <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Quantity</p>
                          <div className="relative">
                            <motion.input
                              type="number"
                              animate={shakeQuantity ? { x: [-10, 10, -10, 10, 0] } : {}}
                              transition={{ duration: 0.4 }}
                              className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                              placeholder="1"
                              min={selectedBusiness.triggerMinQuantity || 1}
                              max={selectedBusiness.triggerMaxQuantity || 9999}
                              value={formData.quantity}
                              onChange={(e) => {
                                const minQty = selectedBusiness.triggerMinQuantity || 1;
                                const maxQty = selectedBusiness.triggerMaxQuantity || 9999;
                                const rawVal = e.target.value;
                                
                                if (rawVal === '') {
                                  setFormData({ ...formData, quantity: '' as any, amount: '0' });
                                  return;
                                }
                                
                                let qty = parseInt(rawVal);
                                if (isNaN(qty)) return;

                                if (qty > maxQty || qty < minQty) {
                                  setShakeQuantity(true);
                                  setTimeout(() => setShakeQuantity(false), 400);
                                  if (qty > maxQty) qty = maxQty;
                                }
                                
                                const newAmount = qty * (selectedBusiness.triggerAmount ? getCurrentMarketPrice(selectedBusiness, state.investments) : 0);
                                setFormData({ ...formData, quantity: qty, amount: new Intl.NumberFormat('en-IN').format(newAmount) });
                              }}
                              onBlur={() => {
                                const minQty = selectedBusiness.triggerMinQuantity || 1;
                                const maxQty = selectedBusiness.triggerMaxQuantity || 9999;
                                let qty = parseInt(formData.quantity as any);
                                if (isNaN(qty) || qty < minQty) qty = minQty;
                                if (qty > maxQty) qty = maxQty;
                                
                                const newAmount = qty * (selectedBusiness.triggerAmount ? getCurrentMarketPrice(selectedBusiness, state.investments) : 0);
                                setFormData({ ...formData, quantity: qty, amount: new Intl.NumberFormat('en-IN').format(newAmount) });
                              }}
                            />
                          </div>
                       </div>
                     )}
                     
                     <div className="hidden md:block w-full border-b border-gray-200 dark:border-[#44546A] pt-2 px-4 pb-2.5 md:p-4 relative z-10 md:flex-1">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 md:mb-2 uppercase tracking-wider">Duration (M)</p>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-transparent px-0 py-0 pb-2 md:pb-0 md:py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="12"
                            value={formData.timePeriodMonths}
                            onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                          />
                        </div>
                     </div>
                     <div className="md:hidden w-full pt-3 px-4 pb-4 relative z-10">
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center space-x-2">
                             <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium uppercase tracking-wider">Brokerage ROI</p>
                             <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center text-[8px] text-gray-500 dark:text-[#7F8895]">i</div>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer" onClick={() => setShowBrokerageROI(!showBrokerageROI)}>
                            <div className={`w-9 h-5 rounded-full transition-colors ${showBrokerageROI ? "bg-[#4184F3]" : "bg-gray-300 dark:bg-[#4B5565]"}`}>
                              <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${showBrokerageROI ? "translate-x-4" : ""} shadow-sm`}></div>
                            </div>
                          </div>
                        </div>
                        {showBrokerageROI && (
                          <div className="space-y-4 pt-4 pb-1 mt-3 border-t border-gray-200 dark:border-[#44546A]">
                            <div className="flex justify-between items-center">
                              <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Expected ROI (%)</p>
                              <input
                                type="number"
                                className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                placeholder="10.5"
                                value={expectedRoi}
                                onChange={(e) => setExpectedRoi(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Duration (M)</p>
                              <input
                                type="number"
                                className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                placeholder="12"
                                value={formData.timePeriodMonths}
                                onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Investor Brokerage (%)</p>
                               <input
                                  type="number"
                                  className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                  placeholder="2"
                                  value={formData.adminCommissionInvestorPct}
                                  onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-[13px] text-gray-700 dark:text-[#C4C4C4] font-medium">Business Brokerage (%)</p>
                               <input
                                  type="number"
                                  className="w-16 bg-transparent px-0 py-1 text-right text-[15px] font-medium text-[#4184F3] outline-none border-b border-gray-200 dark:border-[#44546A] focus:border-[#4184F3]"
                                  placeholder="2"
                                  value={formData.adminCommissionBusinessPct}
                                  onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                                />
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Secondary Toggles Card */}
                <div className="hidden md:block bg-white dark:bg-transparent dark:md:bg-[#181818] relative p-4 space-y-4 border-b border-gray-200 dark:border-[#44546A]">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center space-x-2">
                       <span className="text-[14px] text-gray-900 dark:text-[#F1F5F9] font-medium">Brokerage ROI</span>
                       <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-[#7F8895] flex items-center justify-center text-[9px] text-gray-500 dark:text-[#7F8895]">i</div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer" onClick={() => setShowBrokerageROI(!showBrokerageROI)}>
                      <div className={`w-9 h-5 rounded-full transition-colors ${showBrokerageROI ? "bg-[#4184F3]" : "bg-gray-300 dark:bg-[#4B5565]"}`}>
                        <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${showBrokerageROI ? "translate-x-4" : ""} shadow-sm`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {showBrokerageROI && (
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-[#44546A] pt-4">
                        <div className="flex items-center space-x-2">
                           <p className="text-[14px] text-gray-900 dark:text-[#F1F5F9] font-medium">Expected ROI (%)</p>
                        </div>
                         <input
                            type="number"
                            className="w-20 bg-transparent px-2 py-1.5 text-right text-[15px] font-medium text-[#4184F3] outline-none"
                            placeholder="10.5"
                            value={expectedRoi}
                            onChange={(e) => setExpectedRoi(e.target.value)}
                          />
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-[#44546A] pt-4">
                         <p className="text-[14px] text-gray-900 dark:text-[#F1F5F9] font-medium">Investor Brokerage (%)</p>
                         <input
                            type="number"
                            className="w-20 bg-transparent px-2 py-1.5 text-right text-[15px] font-medium text-[#4184F3] outline-none"
                            placeholder="2"
                            value={formData.adminCommissionInvestorPct}
                            onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                          />
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-[#44546A] pt-4">
                         <p className="text-[14px] text-gray-900 dark:text-[#F1F5F9] font-medium">Business Brokerage (%)</p>
                         <input
                            type="number"
                            className="w-20 bg-transparent px-2 py-1.5 text-right text-[15px] font-medium text-[#4184F3] outline-none"
                            placeholder="2"
                            value={formData.adminCommissionBusinessPct}
                            onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                          />
                      </div>
                    </div>
                  )}
                </div>

            </div>

            {/* Desktop Bottom Section */}
            <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a1f26] border-t border-gray-200 dark:border-[#44546A] pb-6 pt-3 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 dark:text-[#8F8F8F] text-[12px] font-medium">Investment Amount <span className="text-[#4184F3] ml-1">₹{formData.amount || "0"}</span></span>
                {(() => {
                   const amt = parseFloat((formData.amount || "0").replace(/,/g, "")) || 0;
                   const invPct = parseFloat(formData.adminCommissionInvestorPct) || 0;
                   const bizPct = parseFloat(formData.adminCommissionBusinessPct) || 0;
                   const totalBrokerage = amt * ((invPct + bizPct) / 100);
                   return <span className="text-gray-500 dark:text-[#8F8F8F] text-[12px] font-medium">Brokerage <span className="text-[#4184F3] ml-1">{formatINR(totalBrokerage)}</span></span>;
                })()}
              </div>
              <SwipeButton
                actionType={orderMode}
                text={orderMode === "BUY" ? "SWIPE TO BUY" : "SWIPE TO SELL"}
                successText="Investment Successful"
                onSuccess={() => {
                   if (!selectedBusiness || !selectedInvestor) {
                     alert("Please select both a business and an investor.");
                     return;
                   }
                   handleAddSubmit({ preventDefault: () => {} } as any);
                }}
              />
            </div>

            {/* Mobile Bottom Section */}
            <div 
              className={`md:hidden shrink-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 transition-all duration-100 ease-out ${(showInvestorSelect || showBusinessSelect) ? 'hidden' : 'block'}`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                {(() => {
                   const amt = parseFloat((formData.amount || "0").replace(/,/g, "")) || 0;
                   const invPct = parseFloat(formData.adminCommissionInvestorPct) || 0;
                   const bizPct = parseFloat(formData.adminCommissionBusinessPct) || 0;
                   const totalBrokerage = amt * ((invPct + bizPct) / 100);
                   return (
                     <>
                       <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#A3ACB8" }}>
                         <span className="uppercase tracking-wider text-[10px]">Amount</span>
                         <span style={{ color: "#4184F3", fontSize: "13px", fontWeight: 500 }}>₹{formData.amount || "0"}</span>
                       </div>
                       <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#A3ACB8" }}>
                         <span className="uppercase tracking-wider text-[10px]">Brokerage</span>
                         <span style={{ color: "#4184F3", fontSize: "13px", fontWeight: 500 }}>{formatINR(totalBrokerage)}</span>
                       </div>
                     </>
                   );
                })()}
              </div>

              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <div style={{ width: "100%", maxWidth: "340px" }} className="relative group">
                  <SwipeButton
                    actionType={orderMode}
                    text={orderMode === "BUY" ? "SWIPE TO BUY" : "SWIPE TO SELL"}
                    successText="Investment Successful"
                    onSuccess={() => {
                       if (!selectedBusiness || !selectedInvestor) {
                         alert("Please select both a business and an investor.");
                         return;
                       }
                       handleAddSubmit({ preventDefault: () => {} } as any);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Overlays for Business and Investor selection */}
            {/* Business Select Overlay */}
            <AnimatePresence>
               {showBusinessSelect && (
                 <>
                   <motion.div
                     initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                     transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                     className="absolute inset-0 bg-white dark:bg-kite-bg dark:md:bg-[#181818] z-50 flex flex-col"
                   >
                     <div className="flex items-center px-4 py-3 bg-white dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] shrink-0 z-10 mobile-header-safe">
                       <button onClick={() => setShowBusinessSelect(false)} className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center">
                         <ArrowLeft className="w-5 h-5" />
                       </button>
                       <h3 className="ml-3 text-[16px] font-medium text-gray-900 dark:text-[#F1F5F9] tracking-wide">Select Business</h3>
                     </div>
                     <div className="p-4 shrink-0 border-b border-gray-200 dark:border-[#44546A]">
                       <div className="relative">
                         <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-[#A3ACB8]" />
                         <input
                           type="text" autoFocus placeholder="Search businesses..."
                           className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#39475B] border border-gray-200 dark:border-[#44546A] rounded-[4px] text-[15px] text-gray-900 dark:text-[#F1F5F9] outline-none focus:border-[#4184F3] focus:ring-1 focus:ring-[#4184F3]/20 transition-all"
                           value={businessSearch} onChange={(e) => setBusinessSearch(e.target.value)}
                         />
                       </div>
                     </div>
                     <div className="overflow-y-auto flex-1 hide-scrollbar pb-4">
                       {activeBusinesses
                         .filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(businessSearch.toLowerCase()))
                         .map((b, idx) => (
                            <div
                              key={`mob_sel_biz_${b.id}_${idx}`}
                             className="px-4 py-3.5 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-[#44546A]"
                             onClick={() => {
                               const isTrigger = b.investmentType === 'trigger';
                               const minQty = b.triggerMinQuantity || 1;
                               const amount = isTrigger && b.triggerAmount
                                 ? new Intl.NumberFormat("en-IN").format(getCurrentMarketPrice(b, state.investments) * minQty)
                                 : b.fundingRequired ? b.fundingRequired.toLocaleString("en-IN") : "";
                               setFormData({ ...formData, businessId: b.id, amount: amount, quantity: minQty });
                               setShowBusinessSelect(false);
                             }}
                           >
                             <div>
                               <span className="font-medium text-[14px] text-gray-900 dark:text-[#F1F5F9] uppercase">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>
                               <span className="text-[12px] text-gray-500 dark:text-[#A3ACB8] block mt-0.5">ID: {b.businessId}</span>
                             </div>
                           </div>
                         ))}
                     </div>
                   </motion.div>
                 </>
               )}
            </AnimatePresence>


          </motion.div>
        )}
        <AddInvestmentModal 
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setIsFromAnalysis(false);
            setAddModalBusinessId("");
            setAddModalInvestorId("");
          }}
          initialBusinessId={addModalBusinessId}
          initialInvestorId={addModalInvestorId}
        />
      </AnimatePresence>
      <div
        className={`w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden ${showAddForm ?"hidden md:block" :"block"}`}
      >
        {""}
        {renderedList}
      </div>{""}
      <AnimatePresence>
      {/* Details Modal */}
      {selectedInvestment &&
        (() => {
          const business = state.businesses.find(
            (b) => b.id === selectedInvestment.businessId,
          );
          const investor = state.investors.find(
            (i) => i.id === selectedInvestment.investorId,
          );
          const overallTrend =
            marketState.trends[selectedInvestment.businessId] || 0;
          const isCompleted = selectedInvestment.status ==="completed";
          const activeGroupedInvestments =
            selectedInvestment.groupedInvestmentsList.filter((i: any) =>
              selectedInvestmentIds.includes(i.id),
            );
          const totalAmount = activeGroupedInvestments.reduce(
            (sum: number, i: any) => sum + i.amount,
            0,
          );
          const calculateLiveProfit = () => {
            const { liveProfit } = globalCalculateLiveProfit(
              activeGroupedInvestments,
              selectedInvestment.businessId,
              marketState.trends,
              state.settings,
            );
            const completed = Number(withdrawFormData.completedMonths) || 12;
            const scaledProfit = liveProfit * (completed / 12);
            return {
              totalProfit: scaledProfit,
              fullLiveProfit: liveProfit,
              rmasMarketCover: 0,
            };
          };
          

  const handleConfirmWithdraw = () => {


            const profitDetails = calculateLiveProfit();
            const prematurePenalty = Math.max(
              0,
              profitDetails.fullLiveProfit - profitDetails.totalProfit,
            );
            const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
            const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
            const totalCredited = Math.max(
              0,
              totalAmount + profitDetails.totalProfit - rmasFee - happyTax,
            );
            let rmasSubsidyPays = 0;
            if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
              rmasSubsidyPays =
                totalAmount *
                (business.rmasSubsidy / 100) *
                ((Number(withdrawFormData.completedMonths) || 12) / 12);
            }
            const numSelected = activeGroupedInvestments.length;
            if (numSelected === 0) return;
            activeGroupedInvestments.forEach((invToUpdate: any) => {
              const ratio = invToUpdate.amount / totalAmount;
              dispatch({
                type:"UPDATE_INVESTMENT",
                payload: {
                  ...invToUpdate,
                  status:"completed",
                  payoutDetails: {
                    rmasCommission: rmasFee * ratio,
                    happyIncomeTax: happyTax * ratio,
                    rmasPrematurePenalty: prematurePenalty * ratio,
                    totalCredited: totalCredited * ratio,
                    payoutDate: new Date().toISOString().split("T")[0],
                    rmasMarketCover: profitDetails.rmasMarketCover * ratio,
                    rmasSubsidyPays: rmasSubsidyPays * ratio,
                  },
                },
              });
            });
            setSelectedInvestment(null);
            setWithdrawStep(0);
            setSuccessData({
               businessName: business?.shortName ? business.shortName.toUpperCase() : (business?.name || ""),
               investorName: investor?.name || "",
               amount: totalCredited,
               type: "SELL",
            });
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
          };
          const expectedFixedProfit = activeGroupedInvestments.reduce(
            (sum: number, i: any) => sum + (i.amount * i.interestRate) / 100,
            0,
          );
          const actualDetailProfit = activeGroupedInvestments.reduce(
            (sum: number, i: any) => {
              const tr = marketState.trends[i.businessId] || 0;
              return sum + (i.amount * tr) / 100;
            },
            0,
          );
          const isDetailTotalProfit = actualDetailProfit >= 0;
          let groupLiveProf = 0;
          let groupCurrentVal = totalAmount;
          if (!isCompleted) {
            const { liveProfit, currentValue } = globalCalculateLiveProfit(
              activeGroupedInvestments,
              selectedInvestment.businessId,
              marketState.trends,
              state.settings,
            );
            groupLiveProf = liveProfit;
            groupCurrentVal = currentValue;
          }
          const holdingProfit = isCompleted
            ? actualDetailProfit
            : groupLiveProf;
          const curValue = isCompleted
            ? totalAmount + holdingProfit
            : groupCurrentVal;
          const isProfit = holdingProfit >= 0;
          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 max-md:bg-kite-bg max-md:dark:bg-kite-bg dark:md:bg-[#181818] md:bg-black/40 dark:md:bg-black/70" onClick={() => setSelectedInvestment(null)}></motion.div>
              {""}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                className="bg-kite-bg dark:bg-kite-surface md:rounded w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col overflow-hidden relative shadow-none md:border md:border-gray-200/50 dark:md:border-[#383838]/50">
                {""}
                <div className="shrink-0 bg-kite-surface border-b border-kite-border px-3 py-2 md:px-4 md:py-3 flex justify-between items-center z-10 mobile-modal-safe">
                  {""}
                  <div className="flex items-center space-x-2">
                    {""}
                    <button
                      onClick={() => setSelectedInvestment(null)}
                      className="p-2 -ml-2 text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] rounded-full transition-colors outline-none focus:outline-none focus:ring-0 active:outline-none flex items-center justify-center"
                    >
                      {""}
                      <ArrowLeft className="w-[24px] h-[24px]" />{""}
                    </button>{""}
                    <h3 className="font-medium text-[15px] md:text-[16px] ] text-kite-text">
                      {""}
                      Portfolio Details{""}
                    </h3>{""}
                  </div>{""}
                  <div className="flex items-center relative">
                    {""}
                    {selectedInvestment.status ==="active" && (
                      <div className="relative">
                        {""}
                        <button
                          onClick={() => setShowTradeOptions(!showTradeOptions)}
                          className="md:hidden p-2 -mr-2 text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] rounded-full transition-colors outline-none"
                        >
                          {""}
                          <MoreVertical className="w-[24px] h-[24px]" />{""}
                        </button>{""}
                        
                        {/* Desktop Add/Exit Buttons */}
                        <div className="hidden md:flex items-center space-x-3 mr-2">
                           <button 
                             onClick={() => {
                               setShowTradeOptions(false);
                               setFormData({
                                 ...formData,
                                 businessId: selectedInvestment.businessId,
                                 investorId: selectedInvestment.investorId,
                                 amount:"",
                               });
                               setExpectedRoi(
                                 selectedInvestment.interestRate
                                   ? selectedInvestment.interestRate.toString()
                                   :"10.5",
                               );
                               setIsBuyFlow(true);
                               setAddModalBusinessId(selectedInvestment.businessId);
                               setAddModalInvestorId(selectedInvestment.investorId);
                               setSelectedInvestment(null);
                               setShowAddForm(true);
                             }}
                             className="px-4 py-1.5 bg-[#4184F3] hover:bg-[#387ED1] text-white text-[13px] font-medium rounded transition-colors"
                           >
                             ADD
                           </button>
                           <button 
                             onClick={() => {
                               setShowTradeOptions(false);
                               let defaultComm = 0;
                               let defaultTax = 0;
                               const prof = globalCalculateLiveProfit(
                                 selectedInvestment.groupedInvestmentsList.filter(
                                   (i: any) =>
                                     selectedInvestmentIds.includes(i.id),
                                 ),
                                 selectedInvestment.businessId,
                                 marketState.trends,
                                 state.settings,
                               ).liveProfit;
                               if (state.settings) {
                                 if (
                                   state.settings.rmasCommission?.enabled
                                 ) {
                                   defaultComm =
                                     state.settings.rmasCommission.type ==="percentage"
                                       ? (prof *
                                           state.settings.rmasCommission
                                             .value) /
                                         100
                                       : state.settings.rmasCommission
                                           .value;
                                 }
                                 if (state.settings.tax?.enabled) {
                                   defaultTax =
                                     state.settings.tax.type ==="percentage"
                                       ? (prof *
                                           state.settings.tax.value) /
                                         100
                                       : state.settings.tax.value;
                                 }
                               }
                               setWithdrawFormData({
                                 ...withdrawFormData,
                                 completedMonths: String(
                                   selectedInvestment.timePeriodMonths,
                                 ),
                                 rmasCommission: Math.max(
                                   0,
                                   defaultComm,
                                 ).toFixed(2),
                                 happyIncomeTax: Math.max(
                                   0,
                                   defaultTax,
                                 ).toFixed(2),
                               });
                               setWithdrawStep(1);
                             }}
                             className="px-4 py-1.5 bg-[#DF514C] dark:bg-[#E25F5B] hover:bg-[#C93B3B] text-white text-[13px] font-medium rounded transition-colors"
                           >
                             SELL
                           </button>
                        </div>
                        <AnimatePresence>
                          {""}
                          {showTradeOptions && (
                            <>
                              {""}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowTradeOptions(false)}
                              ></div>{""}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.15, ease:"easeOut" }}
                                className="absolute top-full right-0 mt-1 w-[100px] bg-kite-surface shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-kite-border rounded-[12px] overflow-hidden z-50 py-0.5"
                              >
                                {""}
                                <button
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-kite-blue hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors outline-none"
                                  onClick={() => {
                                    setShowTradeOptions(false);
                                    setFormData({
                                      ...formData,
                                      businessId: selectedInvestment.businessId,
                                      investorId: selectedInvestment.investorId,
                                      amount:"",
                                    });
                                    setExpectedRoi(
                                      selectedInvestment.interestRate
                                        ? selectedInvestment.interestRate.toString()
                                        :"10.5",
                                    );
                                    setIsBuyFlow(true);
                                    setAddModalBusinessId(selectedInvestment.businessId);
                                    setAddModalInvestorId(selectedInvestment.investorId);
                                    setSelectedInvestment(null);
                                    setShowAddForm(true);
                                  }}
                                >
                                  {""}
                                  BUY{""}
                                </button>{""}
                                <button
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B] hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors border-t border-kite-border outline-none"
                                  onClick={() => {
                                    setShowTradeOptions(false);
                                    let defaultComm = 0;
                                    let defaultTax = 0;
                                    const prof = globalCalculateLiveProfit(
                                      selectedInvestment.groupedInvestmentsList.filter(
                                        (i: any) =>
                                          selectedInvestmentIds.includes(i.id),
                                      ),
                                      selectedInvestment.businessId,
                                      marketState.trends,
                                      state.settings,
                                    ).liveProfit;
                                    if (state.settings) {
                                      if (
                                        state.settings.rmasCommission?.enabled
                                      ) {
                                        defaultComm =
                                          state.settings.rmasCommission.type ==="percentage"
                                            ? (prof *
                                                state.settings.rmasCommission
                                                  .value) /
                                              100
                                            : state.settings.rmasCommission
                                                .value;
                                      }
                                      if (state.settings.tax?.enabled) {
                                        defaultTax =
                                          state.settings.tax.type ==="percentage"
                                            ? (prof *
                                                state.settings.tax.value) /
                                              100
                                            : state.settings.tax.value;
                                      }
                                    }
                                    setWithdrawFormData({
                                      ...withdrawFormData,
                                      completedMonths: String(
                                        selectedInvestment.timePeriodMonths,
                                      ),
                                      rmasCommission: Math.max(
                                        0,
                                        defaultComm,
                                      ).toFixed(2),
                                      happyIncomeTax: Math.max(
                                        0,
                                        defaultTax,
                                      ).toFixed(2),
                                    });
                                    setWithdrawStep(1);
                                    // Jump to Sell Flow
                                  }}
                                >
                                  {""}
                                  SELL{""}
                                </button>{""}
                              </motion.div>{""}
                            </>
                          )}{""}
                        </AnimatePresence>{""}
                      </div>
                    )}{""}
                  </div>{""}
                </div>{""}
                <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">
                  {""}
                  <>
                    {""}
                    <div className="flex justify-between items-start mb-4">
                      {""}
                      <div>
                        {""}
                        <h4 className="text-[15px] md:text-[16px] leading-[20px] font-normal text-kite-blue uppercase">
                          {""}
                          {business?.shortName ? business.shortName.toUpperCase() : business?.name?.toUpperCase()}{""}
                        </h4>{""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                          {""}
                          Investment ID: #{selectedInvestment.id} •{""}
                          {selectedInvestment.status.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <span
                          className={"inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] md:text-[11px] font-medium" +
                            (overallTrend >= 0
                              ?"bg-[#E6F6ED] dark:bg-[#5B9A5D]/$1 text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"bg-[#FCEBEB] dark:bg-[#E25F5B]/$1 text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {overallTrend >= 0 ?"+" :""}{""}
                          {overallTrend.toFixed(2)}%{""}
                        </span>{""}
                      </div>{""}
                    </div>{""}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 pb-4 border-b border-kite-border">
                      {""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Capital Invested{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] ] font-medium text-kite-text">
                          {""}
                          {formatINR(totalAmount)}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Current Value{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] ] font-medium text-kite-text">
                          {""}
                          {formatINR(curValue)}{""}
                        </p>{""}
                      </div>{""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Live P&L{""}
                        </p>{""}
                        <p
                          className={"text-[13px] md:text-[14px] ] font-medium" +
                            (isProfit
                              ? selectedInvestment.status ==="completed"
                                ?"text-kite-blue"
                                :"text-[#4CAF50] dark:text-[#5B9A5D]"
                              :"text-[#DF514C] dark:text-[#E25F5B]")
                          }
                        >
                          {""}
                          {isProfit ?"+" :""} {formatINR(holdingProfit)}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Investor{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {investor?.name?.toUpperCase()}{""}
                        </p>{""}
                      </div>{""}
                      <div>
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Start Date{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {activeGroupedInvestments.length > 1
                            ?"Multiple Dates"
                            : new Date(
                                selectedInvestment.startDate,
                              ).toLocaleDateString("en-IN")}{""}
                        </p>{""}
                      </div>{""}
                      <div className="text-right">
                        {""}
                        <p className="text-[11px] md:text-[12px] text-kite-text-light mb-0.5">
                          {""}
                          Expected Maturity{""}
                        </p>{""}
                        <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                          {""}
                          {activeGroupedInvestments.length > 1
                            ?"Multiple Dates"
                            : new Date(
                                selectedInvestment.endDate,
                              ).toLocaleDateString("en-IN")}{""}
                        </p>{""}
                      </div>{""}
                    </div>{""}
                    {selectedInvestment.groupedInvestmentsList.length > 1 &&
                      withdrawStep === 0 && (
                        <div className="pt-5 mb-2">
                          {""}
                          <p className="text-[11px] md:text-[12px] font-medium text-kite-text-light uppercase tracking-[0.5px] mb-3">
                            {""}
                            {selectedInvestment.status ==="active"
                              ?"SELECT QUANTITIES TO BOOK PROFIT"
                              :"SELECT QUANTITIES TO VIEW"}{""}
                          </p>{""}
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mt-2">
                            {""}
                            <label className="flex items-center justify-between cursor-pointer pb-3 border-b border-kite-border">
                              {""}
                              <span className="text-[13px] md:text-[14px] text-kite-text">
                                {""}
                                {selectedInvestment.status ==="active"
                                  ?"Withdraw All Quantities"
                                  :"View All Quantities"}{""}
                              </span>{""}
                              <div className="relative">
                                {""}
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={
                                    selectedInvestmentIds.length ===
                                    selectedInvestment.groupedInvestmentsList
                                      .length
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedInvestmentIds(
                                        selectedInvestment.groupedInvestmentsList.map(
                                          (i: any) => i.id,
                                        ),
                                      );
                                    } else {
                                      setSelectedInvestmentIds([]);
                                    }
                                  }}
                                />{""}
                                <div
                                  className={`block w-9 h-5 rounded-full transition-colors ${selectedInvestmentIds.length === selectedInvestment.groupedInvestmentsList.length ?"bg-kite-blue" :"bg-kite-border"}`}
                                ></div>{""}
                                <div
                                  className={`absolute left-0.5 top-0.5 bg-white dark:bg-kite-surface w-4 h-4 rounded-full transition-transform ${selectedInvestmentIds.length === selectedInvestment.groupedInvestmentsList.length ?"transform translate-x-4" :""}`}
                                ></div>{""}
                              </div>{""}
                            </label>{""}
                            {selectedInvestment.groupedInvestmentsList.map(
                              (invUnit: any, idx: number) => {
                                const unitProf = globalCalculateLiveProfit(
                                  [invUnit],
                                  selectedInvestment.businessId,
                                  marketState.trends,
                                  state.settings,
                                ).liveProfit;
                                const unitCurVal = invUnit.amount + unitProf;
                                const unitIsProfit = unitProf >= 0;
                                return (
                                  <label
                                    key={`invUnit_${invUnit.id}_${idx}`}
                                    className="flex items-start space-x-3 cursor-pointer py-1 border-b border-kite-bg last:border-0"
                                  >
                                    {""}
                                    <div className="pt-2">
                                      {""}
                                      <input
                                        type="checkbox"
                                        checked={selectedInvestmentIds.includes(
                                          invUnit.id,
                                        )}
                                        onChange={(e) => {
                                          if (e.target.checked)
                                            setSelectedInvestmentIds([
                                              ...selectedInvestmentIds,
                                              invUnit.id,
                                            ]);
                                          else
                                            setSelectedInvestmentIds(
                                              selectedInvestmentIds.filter(
                                                (id) => id !== invUnit.id,
                                              ),
                                            );
                                        }}
                                        className="rounded text-kite-blue focus:ring-[#387ED1] cursor-pointer w-[16px] h-[16px] border-kite-border"
                                      />{""}
                                    </div>{""}
                                    <div className="hidden md:flex flex-1 items-center justify-between pt-1.5">
                                      {""}
                                      <span className="text-kite-text-light text-[13px] md:text-[14px] truncate max-w-[120px]">
                                        {""}
                                        #{invUnit.id}{""}
                                      </span>{""}
                                      <span className="font-medium text-kite-text text-[13px] md:text-[14px]">
                                        {""}
                                        {formatINR(invUnit.amount)}{""}
                                      </span>{""}
                                    </div>{""}
                                    <div className="md:hidden flex-1 flex justify-between items-center">
                                      {""}
                                      <div className="flex flex-col">
                                        {""}
                                        <span className="text-[11px] md:text-[12px] text-kite-text-light">
                                          Invested
                                        </span>{""}
                                        <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                          {formatINR(invUnit.amount)}
                                        </span>{""}
                                      </div>{""}
                                      <div className="flex flex-col items-end">
                                        {""}
                                        <div className="flex items-center gap-1.5">
                                          {""}
                                          <span className="text-[11px] md:text-[12px] text-kite-text-light">
                                            Current
                                          </span>{""}
                                          <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                                            {formatINR(unitCurVal)}
                                          </span>{""}
                                        </div>{""}
                                        <span
                                          className={`text-[11px] md:text-[12px] font-normal ${unitIsProfit ? (selectedInvestment.status ==="completed" ?"text-kite-blue" :"text-[#4CAF50] dark:text-[#5B9A5D]") :"text-[#DF514C] dark:text-[#E25F5B]"}`}
                                        >
                                          {""}
                                          {unitIsProfit ?"+" :""}
                                          {formatINR(unitProf)}{""}
                                        </span>{""}
                                      </div>{""}
                                    </div>{""}
                                  </label>
                                );
                              },
                            )}{""}
                          </div>{""}
                        </div>
                      )}{""}
                    {selectedInvestment.status ==="active" &&
                      withdrawStep === 1 && (
                        <div className="mt-4 pt-4 border-t border-kite-border/50">
                          {""}
                          <h4 className="text-[#DF514C] dark:text-[#E25F5B] font-medium text-[11px] md:text-[12px] tracking-wider mb-4">
                            {""}
                            SELL DETAILS{""}
                          </h4>{""}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                Completed Months{""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-blue/30 py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-blue"
                                value={withdrawFormData.completedMonths}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    completedMonths: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                RMAS Comm (₹){""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-border py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-blue"
                                value={withdrawFormData.rmasCommission}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    rmasCommission: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                            <div>
                              {""}
                              <label className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-widest block mb-1">
                                {""}
                                Income Tax (₹){""}
                              </label>{""}
                              <input
                                type="number"
                                className="w-full border-b border-kite-border py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-red text-[#DF514C] dark:text-[#E25F5B]"
                                value={withdrawFormData.happyIncomeTax}
                                onChange={(e) =>
                                  setWithdrawFormData({
                                    ...withdrawFormData,
                                    happyIncomeTax: e.target.value,
                                  })
                                }
                              />{""}
                            </div>{""}
                          </div>{""}
                          <div className="flex flex-col gap-1.5 mb-6 text-[11px] md:text-[12px]">
                            {""}
                            <div className="flex justify-between items-center text-kite-text-light">
                              {""}
                              <span>P&L Current Trend:</span>{""}
                              <span
                                className={
                                  calculateLiveProfit().totalProfit >= 0
                                    ?"text-[#4CAF50] dark:text-[#5B9A5D] font-medium"
                                    :"text-[#DF514C] dark:text-[#E25F5B] font-medium"
                                }
                              >
                                {""}
                                {calculateLiveProfit().totalProfit > 0
                                  ?"+"
                                  :""}{""}
                                {(
                                  (calculateLiveProfit().totalProfit /
                                    totalAmount) *
                                  100
                                ).toFixed(2)}{""}
                                %{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between items-center text-kite-text-light">
                              {""}
                              <span>Net Yield:</span>{""}
                              <span
                                className={
                                  calculateLiveProfit().totalProfit < 0
                                    ?"text-[#DF514C] dark:text-[#E25F5B] font-medium"
                                    :"text-[#4CAF50] dark:text-[#5B9A5D] font-medium"
                                }
                              >
                                {""}
                                {calculateLiveProfit().totalProfit < 0
                                  ?"-"
                                  :"+"}{""}
                                {formatINR(
                                  Math.abs(calculateLiveProfit().totalProfit),
                                )}{""}
                              </span>{""}
                            </div>{""}
                          </div>{""}
                        </div>
                      )}{""}
                    {selectedInvestment.status ==="completed" &&
                      activeGroupedInvestments.some(
                        (i: any) => i.payoutDetails,
                      ) && (
                        <div className="p-4 bg-kite-green/5 border border-kite-green/20 rounded-sm">
                          {""}
                          <h4 className="font-medium text-[#4CAF50] dark:text-[#5B9A5D] flex items-center space-x-2 mb-4">
                            {""}
                            <CheckCircle className="w-4 h-4" />{""}
                            <span>Completed Settlement Breakdown</span>{""}
                          </h4>{""}
                          <div className="space-y-2 text-[13px] md:text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">
                            {""}
                            <div className="flex justify-between">
                              {""}
                              <span>Gross Payout (Capital + Profit)</span>{""}
                              <span className="font-medium">
                                {""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.totalCredited || 0) +
                                      (i.payoutDetails?.rmasCommission || 0) +
                                      (i.payoutDetails?.happyIncomeTax || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px]">
                              {""}
                              <span>RMAS Commission Deducted</span>{""}
                              <span className="text-[#DF514C] dark:text-[#E25F5B]">
                                {""}
                                -{""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.rmasCommission || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px]">
                              {""}
                              <span>Income Tax Deducted</span>{""}
                              <span className="text-[#DF514C] dark:text-[#E25F5B]">
                                {""}
                                -{""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.happyIncomeTax || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between pt-2 border-t border-kite-green/20 mt-2 font-medium">
                              {""}
                              <span>Net Amount Credited</span>{""}
                              <span>
                                {""}
                                {formatINR(
                                  activeGroupedInvestments.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.payoutDetails?.totalCredited || 0),
                                    0,
                                  ),
                                )}{""}
                              </span>{""}
                            </div>{""}
                            <div className="flex justify-between text-[11px] md:text-[12px] mt-1 text-kite-text-light">
                              {""}
                              <span>Payout Date</span>{""}
                              <span>
                                {""}
                                {activeGroupedInvestments.length > 1
                                  ?"Multiple Dates"
                                  : new Date(
                                      activeGroupedInvestments[0]?.payoutDetails
                                        ?.payoutDate ||
                                        selectedInvestment.payoutDetails
                                          .payoutDate,
                                    ).toLocaleDateString("en-IN")}{""}
                              </span>{""}
                            </div>{""}
                          </div>{""}
                        </div>
                      )}{""}
                  </>{""}
                </div>{""}
                {withdrawStep === 0 &&
                  selectedInvestment.status ==="active" && (
                    <div className="md:hidden">
                    <MobilePortfolioSummary
                      invested={formatINR(totalAmount)}
                      currentValue={formatINR(curValue)}
                      profit={`${isProfit ?"+" :""}${formatINR(holdingProfit)}`}
                      isProfit={isProfit}
                      onSwipeSuccess={() => {
                        let defaultComm = 0;
                        let defaultTax = 0;
                        const prof = globalCalculateLiveProfit(
                          selectedInvestment.groupedInvestmentsList.filter(
                            (i: any) => selectedInvestmentIds.includes(i.id),
                          ),
                          selectedInvestment.businessId,
                          marketState.trends,
                          state.settings,
                        ).liveProfit;
                        if (state.settings) {
                          if (state.settings.rmasCommission?.enabled) {
                            defaultComm =
                              state.settings.rmasCommission.type ==="percentage"
                                ? (prof * state.settings.rmasCommission.value) /
                                  100
                                : state.settings.rmasCommission.value;
                          }
                          if (state.settings.tax?.enabled) {
                            defaultTax =
                              state.settings.tax.type ==="percentage"
                                ? (prof * state.settings.tax.value) / 100
                                : state.settings.tax.value;
                          }
                        }
                        setWithdrawFormData({
                          ...withdrawFormData,
                          completedMonths: String(
                            selectedInvestment.timePeriodMonths,
                          ),
                          rmasCommission: Math.max(0, defaultComm).toFixed(2),
                          happyIncomeTax: Math.max(0, defaultTax).toFixed(2),
                        });
                        setWithdrawStep(1);
                      }}
                    />
                    </div>
                  )}{""}
                {withdrawStep === 1 && (
                  <div className="shrink-0 p-3 md:p-4 z-20 mobile-safe-pb">
                    {""}
                    <div className="md:hidden">
                      {""}
                      <div className="flex justify-between items-center mb-3 px-1">
                        {""}
                        <div className="flex items-baseline space-x-2">
                          {""}
                          <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                            {""}
                            Sell{""}
                          </span>{""}
                          <span className="text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B]">
                            {""}
                            {formatINR(
                              Math.max(
                                0,
                                totalAmount +
                                  calculateLiveProfit().totalProfit -
                                  (Number(withdrawFormData.rmasCommission) ||
                                    0) -
                                  (Number(withdrawFormData.happyIncomeTax) ||
                                    0),
                              ),
                            )}{""}
                          </span>{""}
                        </div>{""}
                      </div>{""}
                      <div className="flex flex-col items-center">
                        {""}
                        <SwipeButton
                          text="SWIPE TO SELL"
                          successText="SETTLING..."
                          actionType="SELL"
                          onSuccess={handleConfirmWithdraw}
                        />{""}
                      </div>{""}
                    </div>{""}
                    <div className="hidden md:flex flex-col items-center">
                      {""}
                      <div className="flex justify-between items-center w-full mb-3 px-1">
                        {""}
                        <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                          {""}
                          Sell Final Amt:{""}
                        </span>{""}
                        <span className="text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B]">
                          {""}
                          {formatINR(
                            Math.max(
                              0,
                              totalAmount +
                                calculateLiveProfit().totalProfit -
                                (Number(withdrawFormData.rmasCommission) || 0) -
                                (Number(withdrawFormData.happyIncomeTax) || 0),
                            ),
                          )}{""}
                        </span>{""}
                      </div>{""}
                      <button
                        onClick={handleConfirmWithdraw}
                        className="w-full py-3 bg-[#DF514C] dark:bg-[#E25F5B] hover:bg-[#C93B3B] text-white font-medium rounded transition-colors uppercase tracking-wider text-[13px] md:text-[14px]"
                      >
                        {""}
                        CONFIRM SELL{""}
                      </button>{""}
                    </div>{""}
                  </div>
                )}{""}
              </motion.div>{""}
            </div>
          );
        })()}
      </AnimatePresence>
      <AnimatePresence>
        {""}
        {showSuccessAnimation && successData && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type:"spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-24 right-0 left-0 mx-4 md:bottom-4 md:left-auto md:right-8 md:mx-0 z-[120] bg-kite-surface shadow-lg rounded-sm border-l-4 border-kite-blue p-4 max-w-sm items-start space-x-3 ${successData.type === "SELL" ? "hidden md:flex" : "flex"}`}
          >
            {""}
            <div className="w-6 h-6 rounded-full bg-kite-blue flex items-center justify-center shrink-0 mt-0.5">
              {""}
              <CheckCircle className="w-4 h-4 text-white" />{""}
            </div>{""}
            <div>
              {""}
              <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                {""}
                {successData.type === "SELL" ? "Profit Booked" : "Investment Booked"}{""}
              </h3>{""}
              <p className="text-[11px] md:text-[12px] text-kite-text-light mt-1 flex flex-col space-y-0.5">
                {""}
                <span>{successData.investorName?.toUpperCase()}</span>{""}
                <span>
                  {""}
                  {successData.type === "SELL" ? "Settled from " : formatINR(successData.amount) + " to "}
                  {successData.businessName?.toUpperCase()}{""}
                </span>{""}
              </p>{""}
            </div>{""}
          </motion.div>
        )}{""}
      </AnimatePresence>{""}
    </div>
  );
}
