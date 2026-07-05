import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { formatINR } from "../utils/mockData";
import {
  Plus,
  Search,
  Users,
  Banknote,
  Building,
  FileText,
  Download,
  X,
  ArrowLeft,
  CreditCard,
  Wallet,
  CheckCircle,
  BadgeCheck,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Investor, Investment, Business } from "../types";
import { INDIAN_BANKS } from "../utils/indianBanks";
import { downloadElementAsPDF } from "../utils/pdfGenerator";
import { getVerificationStats } from "../utils/blueTick";
import { getBaseMarketTrend } from "../utils/marketSimulator";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { calculateLiveProfit } from "../utils/profitCalculator";
import { getUnifiedBankBalance } from "../utils/bankBalance";
import { SwipeButton } from "../components/SwipeButton";
import { LivePortfolioDetail } from "../components/LivePortfolioDetail";
import InvestorDetail from "../components/InvestorDetail";
type ViewMode =
  | "list"
  | "add-step-1"
  | "add-step-2"
  | "withdraw-list"
  | "withdraw-calc"
  | "withdraw-bank"
  | "banking-record"
  | "investor-detail";
const generateId = (prefix: string) =>
  `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;




const formatLargeNumber = (num) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  let formatted = '';
  if (absNum >= 10000000) {
    formatted = (absNum / 10000000).toFixed(2).replace(/\.00$/, '') + ' CR';
  } else if (absNum >= 100000) {
    formatted = (absNum / 100000).toFixed(2).replace(/\.00$/, '') + ' LK';
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(2).replace(/\.00$/, '') + ' K';
  } else {
    formatted = absNum.toFixed(2).replace(/\.00$/, '');
  }
  return (num < 0 ? "-" : "") + formatted;
};

export default function Investors() {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  const statsMap = getVerificationStats(state.businesses, state.investments);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [withdrawTab, setWithdrawTab] = useState<"holdings" | "positions">(
    "holdings",
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  // Scroll preservation
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainRef.current = document.querySelector("main");
  }, []);
  useEffect(() => {
    if (viewMode === "list") {
      if (mainRef.current) {
        setTimeout(() => {
          if (mainRef.current) mainRef.current.scrollTop = scrollPosRef.current;
        }, 10);
      }
    } else {
      if (mainRef.current) {
        scrollPosRef.current = mainRef.current.scrollTop;
        mainRef.current.scrollTop = 0;
      }
    }
  }, [viewMode]);
  // Withdraw State
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(
    null,
  );
  const [selectedInvestments, setSelectedInvestments] = useState<Investment[]>(
    [],
  );
  const [selectedPortfolioInvestment, setSelectedPortfolioInvestment] =
    useState<any>(null);
  const [withdrawFormData, setWithdrawFormData] = useState({
    committedMonths: "12",
    completedMonths: "12",
    rmasCommission: "",
    happyIncomeTax: "",
  });
  const [withdrawQtyMap, setWithdrawQtyMap] = useState<Record<string, number>>(
    {},
  );
  // PDF Modal State
  const [pdfInvestor, setPdfInvestor] = useState<Investor | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifySuccess, setShowVerifySuccess] = useState(false);



  const [pdfProfitSlip, setPdfProfitSlip] = useState<{
    investment: Investment;
    investor: Investor;
    business: Business;
  } | null>(null);
  const [ownerMode, setOwnerMode] = useState<"new" | "existing">("new");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [formData, setFormData] = useState({
    investorId: "",
    name: "",
    bankName: INDIAN_BANKS[0],
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    rmasServiceCharge: "",
  });

  useMobileBackNavigation(viewMode === "add-step-1", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "add-step-2", () => setViewMode("add-step-1"));
  useMobileBackNavigation(viewMode === "withdraw-list", () => setViewMode("investor-detail"));
  useMobileBackNavigation(viewMode === "withdraw-calc", () => setViewMode("withdraw-list"));
  useMobileBackNavigation(viewMode === "withdraw-bank", () => setViewMode("withdraw-calc"));
  useMobileBackNavigation(viewMode === "banking-record", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "investor-detail", () => {
    setViewMode("list");
    setSelectedInvestor(null);
  });
  useMobileBackNavigation(!!pdfInvestor, () => setPdfInvestor(null));
  useMobileBackNavigation(!!pdfProfitSlip, () => setPdfProfitSlip(null));
  useMobileBackNavigation(showOwnerSelect, () => setShowOwnerSelect(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));
  const getTime = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
  const uniqueInvestors = Array.from(
    new Map<string, Investor>(state.investors.map((i) => [i.id, i])).values(),
  );
  const filteredInvestors = uniqueInvestors
    .filter(
      (i) =>
        (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.investorId.includes(searchTerm),
    )
    .map((i) => {
      const activeInvs = state.investments.filter(
        (inv) => inv.investorId === i.id && inv.status !== "completed",
      );
      let totalAmountInvested = activeInvs.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );
      if (i.id === "admin_investor") {
        totalAmountInvested = getUnifiedBankBalance(
          "Radhika M",
          state.businesses,
          state.investors,
          state.investments,
          state.settings,
        );
      }
      let totalLiveProfit = 0;
      const grouped = activeInvs.reduce(
        (acc, inv) => {
          if (!acc[inv.businessId]) acc[inv.businessId] = [];
          acc[inv.businessId].push(inv);
          return acc;
        },
        {} as Record<string, Investment[]>,
      );
      Object.entries(grouped).forEach(([bizId, invs]) => {
        const res = calculateLiveProfit(
          invs as Investment[],
          bizId,
          marketState.trends,
          state.settings,
        );
        totalLiveProfit += res.liveProfit;
      });
      const returnPercentage =
        totalAmountInvested > 0
          ? (totalLiveProfit / totalAmountInvested) * 100
          : 0;
      const hasActive = activeInvs.length > 0;
      const hasCompleted = state.investments.some(
        (inv) => inv.investorId === i.id && inv.status === "completed",
      );
      const status = hasActive
        ? "active"
        : hasCompleted
          ? "withdrawn"
          : "pending";
      return {
        ...i,
        totalInvested: totalAmountInvested,
        totalLiveProfit,
        returnPercentage,
        status,
      };
    })
    .sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    );
  const generateInvestorId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const startAddInvestor = () => {
    let defaultServiceCharge = "";
    if (state.settings && state.settings.formDataRegistration) {
      if (state.settings.formDataRegistration.type === "amount") {
        defaultServiceCharge = String(
          state.settings.formDataRegistration.value,
        );
      }
    }
    setFormData({
      ...formData,
      investorId: generateInvestorId(),
      name: "",
      bankName: INDIAN_BANKS[0],
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      rmasServiceCharge: defaultServiceCharge,
    });
    setViewMode("add-step-1");
  };
  useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'add-step-1' && formData.name && formData.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'add-step-1' && formData.name && formData.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    },
    'shift': (e) => {
      if (viewMode === 'add-step-1' && formData.name && formData.phone) {
        e.preventDefault();
        handleNextStep(e as any);
      }
    }
  }, viewMode === 'add-step-1');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setFormData({
      ...formData,
      accountHolderName:
        formData.accountHolderName || formData.name.toUpperCase(),
      // auto fill all caps
    });
    setViewMode("add-step-2");
  };
  useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    },
    'shift': (e) => {
      if (viewMode === 'add-step-2') {
        e.preventDefault();
        handleVerifiedSave(e as any);
      }
    }
  }, viewMode === 'add-step-2');

  const handleVerifiedSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      const actualNewInvestor: Investor = {
        id: crypto.randomUUID(),
        investorId: formData.investorId,
        name: formData.name,
        totalInvested: 0,
        joinDate: new Date().toISOString(),
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName.toUpperCase(),
        },
        rmasServiceCharge:
          Number(formData.rmasServiceCharge.toString().replace(/,/g, "")) || 0,
      };
      dispatch({ type: "ADD_INVESTOR", payload: actualNewInvestor });
      setIsVerifying(false);
      setShowVerifySuccess(true);
      setTimeout(() => {
        setShowVerifySuccess(false);
        setViewMode("list");
      }, 2000);
    }, 800);
  };
  const handleWithdrawClick = (investor: Investor) => {
    setSelectedInvestor(investor);
    setWithdrawQtyMap({});
    setViewMode("withdraw-list");
  };
  const handleBankingRecordClick = (investor: Investor) => {
    setSelectedInvestor(investor);
    setViewMode("banking-record");
  };
  const handleCreditInvestorClick = (investments: Investment[]) => {
    setSelectedInvestments(investments);
    setWithdrawFormData({
      committedMonths:
        investments.length > 0
          ? investments[0].timePeriodMonths.toString()
          : "12",
      completedMonths:
        investments.length > 0
          ? investments[0].timePeriodMonths.toString()
          : "12",
      rmasCommission: "",
      happyIncomeTax: "",
    });
    setViewMode("withdraw-calc");
  };
  const businessId =
    selectedInvestments.length > 0 ? selectedInvestments[0].businessId : "";
  const business = state.businesses.find((b) => b.id === businessId);
  const isBlueTick = statsMap.get(businessId)?.isBlueTick ?? false;
  const isPreVerified = statsMap.get(businessId)?.isPreVerified ?? false;
  const marketTrend = marketState.trends[businessId] || 0;
  const calculateProfit = () => {
    if (selectedInvestments.length === 0)
      return {
        baseProfit: 0,
        totalProfit: 0,
        marketProfit: 0,
        fullLiveProfit: 0,
        rmasMarketCover: 0,
        marketTrend: 0,
        isPremature: false,
      };
    const { liveProfit, liveTrendPercentage } = calculateLiveProfit(
      selectedInvestments,
      businessId,
      marketState.trends,
      state.settings,
    );
    const completed = Number(withdrawFormData.completedMonths) || 12;
    const scaledProfit = liveProfit * (completed / 12);
    return {
      baseProfit: 0,
      totalProfit: scaledProfit,
      fullLiveProfit: liveProfit,
      marketProfit: scaledProfit,
      rmasMarketCover: 0,
      marketTrend: liveTrendPercentage,
      isPremature: false,
    };
  };
  const calculateFinalPayout = () => {
    if (selectedInvestments.length === 0) return 0;
    const { totalProfit } = calculateProfit();
    const totalPrincipal = selectedInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const grossAmount = totalPrincipal + totalProfit;
    const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
    const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
    return Math.max(0, grossAmount - rmasFee - happyTax);
  };
  const calculateBusinessBurden = () => {
    if (selectedInvestments.length === 0)
      return {
        businessPays: 0,
        rmasSubsidyPays: 0,
        rmasMarketCover: 0,
        totalRmasContribution: 0,
      };
    const business = state.businesses.find(
      (b) => b.id === selectedInvestments[0].businessId,
    );
    let rmasSubsidyPays = 0;
    const completed = Number(withdrawFormData.completedMonths) || 12;
    if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
      selectedInvestments.forEach((inv) => {
        rmasSubsidyPays =
          inv.amount * (business.rmasSubsidy! / 100) * (completed / 12);
      });
    }
    const finalPayout = calculateFinalPayout();
    let businessPays = finalPayout - rmasSubsidyPays;
    if (businessPays < 0) businessPays = 0;
    return {
      businessPays,
      rmasSubsidyPays,
      rmasMarketCover: 0,
      totalRmasContribution: rmasSubsidyPays,
    };
  };
  const goToBanking = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setViewMode("withdraw-bank");
  };
  useKeyboardShortcuts({
    'enter': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    },
    'shift+enter': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    },
    'shift': (e) => {
      if (viewMode === 'withdraw-bank') {
        e.preventDefault();
        handlePay();
      }
    }
  }, viewMode === 'withdraw-bank');

  const handlePay = () => {
    if (selectedInvestments.length === 0 || !selectedInvestor) return;
    const business = state.businesses.find(
      (b) => b.id === selectedInvestments[0].businessId,
    );
    if (!business) return;
    const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
    const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
    const finalPayout = calculateFinalPayout();
    const totalAmount = selectedInvestments.reduce((s, i) => s + i.amount, 0);
    const burden = calculateBusinessBurden();
    const { totalProfit, fullLiveProfit } = calculateProfit();
    const prematurePenalty = Math.max(0, fullLiveProfit - totalProfit);
    selectedInvestments.forEach((inv) => {
      const ratio =
        totalAmount > 0
          ? inv.amount / totalAmount
          : 1 / selectedInvestments.length;
      const updatedInvestment: Investment = {
        ...inv,
        status: "completed",
        payoutDetails: {
          rmasCommission: rmasFee * ratio,
          happyIncomeTax: happyTax * ratio,
          rmasPrematurePenalty: prematurePenalty * ratio,
          totalCredited: finalPayout * ratio,
          payoutDate: new Date().toISOString(),
          rmasMarketCover: burden.rmasMarketCover * ratio,
          rmasSubsidyPays: burden.rmasSubsidyPays * ratio,
        },
      };
      dispatch({ type: "UPDATE_INVESTMENT", payload: updatedInvestment });
    });
    const mergedInv: Investment = {
      ...selectedInvestments[0],
      amount: totalAmount,
      payoutDetails: {
        rmasCommission: rmasFee,
        happyIncomeTax: happyTax,
        rmasPrematurePenalty: prematurePenalty,
        totalCredited: finalPayout,
        payoutDate: new Date().toISOString(),
        rmasMarketCover: burden.rmasMarketCover,
        rmasSubsidyPays: burden.rmasSubsidyPays,
      },
    };
    // Generate Profit Slip
    setPdfProfitSlip({
      investment: mergedInv,
      investor: selectedInvestor,
      business,
    });
    setViewMode("list");
    setSelectedInvestor(null);
    setSelectedInvestments([]);
  };
  const handlePrintProfitSlip = () => {
    downloadElementAsPDF(
      "profit-slip-content",
      `Profit_Slip_${pdfProfitSlip?.investor.name || "Investor"}`,
    );
  };
  const handlePrintInvestorPDF = () => {
    downloadElementAsPDF(
      "investor-pdf-content",
      `Terms_${pdfInvestor?.name || "Investor"}`,
    );
  };
  return (
    <div className="w-full space-y-3 sm:space-y-6 print:m-0 print:p-0">
      {" "}
      {/* --- Hide this whole container during print --- */}{" "}
      <div className="print:hidden space-y-3 sm:space-y-6">
        {" "}
        {viewMode === "investor-detail" && selectedInvestor && (
          <InvestorDetail
            investorId={selectedInvestor.id}
            onBack={() => {
              setViewMode("list");
              setSelectedInvestor(null);
            }}
            onWithdraw={(invs) => {
              if (invs && invs.length > 0) {
                handleCreditInvestorClick(invs);
              } else {
                handleWithdrawClick(selectedInvestor);
              }
            }}
          />
        )}{" "}
        {viewMode === "list" && (
          <>
            {" "}
            <div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4">
              {" "}
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                {" "}
                <div className="hidden md:block">
                  {" "}
                  <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                    My Investors
                  </h2>{" "}
                </div>{" "}
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                  {" "}
                  {/* Action Button (Top on mobile, left of search on desktop) */}{" "}
                  <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                    {" "}
                    <button
                      onClick={startAddInvestor}
                      className="flex items-center space-x-1.5 py-2 text-kite-blue font-medium text-[13px] md:text-[14px] hover:text-blue-600 transition-colors shadow-none"
                    >
                      {" "}
                      <Plus className="w-4 h-4" />{" "}
                      <span>New Investor</span>{" "}
                    </button>{" "}
                  </div>{" "}
                  {/* Search Container (Bottom on mobile, right on desktop) */}{" "}
                  <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">
                    {" "}
                    {!isSearchExpanded ? (
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="-ml-1 md:ml-0 p-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
                      >
                        {" "}
                        <Search className="w-[18px] h-[18px] text-kite-blue" />{" "}
                      </button>
                    ) : (
                      <div className="flex items-center w-full md:w-[250px] transition-all duration-300 bg-white dark:bg-kite-surface md:bg-gray-100 md:dark:bg-[#161616] rounded-sm h-[36px]">
                        {" "}
                        <button
                          onClick={() => {
                            setIsSearchExpanded(false);
                            setSearchTerm("");
                          }}
                          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full mr-1 transition-colors flex-shrink-0"
                        >
                          {" "}
                          <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />{" "}
                        </button>{" "}
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search Eg: Radhika"
                          className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />{" "}
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="p-2 text-gray-600 hover:text-kite-text transition-colors flex-shrink-0"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            </div>{" "}
            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">
              <div className="overflow-hidden">
                {" "}
                {/* Desktop Table View */}{" "}
                <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">
                  {/* DESKTOP HEADER */}
                  <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border">
                    <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">INVESTOR NAME</div>
                    <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                    <div className="w-[18%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">INVEST AMOUNT</div>
                    <div className="w-[16%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">PERCENTAGE</div>
                    <div className="w-[22%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-5">TOTAL PROFIT</div>
                  </div>
                  {filteredInvestors.map((investor, idx) => {
                    const activeInvs = state.investments.filter(
                      (inv) =>
                        inv.investorId === investor.id &&
                        inv.status !== "completed",
                    );
                    let totalAmountInvested = activeInvs.reduce(
                      (sum, inv) => sum + inv.amount,
                      0,
                    );
                    if (investor.id === "admin_investor") {
                      totalAmountInvested = getUnifiedBankBalance(
                        "Radhika M",
                        state.businesses,
                        state.investors,
                        state.investments,
                        state.settings,
                      );
                    }
                    let totalLiveProfit = 0;
                    const grouped = activeInvs.reduce(
                      (acc, inv) => {
                        if (!acc[inv.businessId]) acc[inv.businessId] = [];
                        acc[inv.businessId].push(inv);
                        return acc;
                      },
                      {} as Record<string, Investment[]>,
                    );
                    Object.entries(grouped).forEach(([bizId, invs]) => {
                      const res = calculateLiveProfit(
                        invs as Investment[],
                        bizId,
                        marketState.trends,
                        state.settings,
                      );
                      totalLiveProfit += res.liveProfit;
                    });
                    const returnPercentage =
                      totalAmountInvested > 0
                        ? (totalLiveProfit / totalAmountInvested) * 100
                        : 0;
                    const hasActive = activeInvs.length > 0;
                    const hasCompleted = state.investments.some(
                      (inv) =>
                        inv.investorId === investor.id &&
                        inv.status === "completed",
                    );
                    const status = hasActive
                      ? "active"
                      : hasCompleted
                        ? "withdrawn"
                        : "pending";
                    return (
                      <div
                        key={`inv_${investor.id}_${idx}`}
                        onClick={() => {
                          setSelectedInvestor(investor);
                          setViewMode("investor-detail");
                        }}
                        className="flex flex-col bg-white dark:bg-kite-bg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors min-h-[50px] group"
                      >
                        {/* Mobile View */}
                        <div className="flex md:hidden items-center justify-between p-3 border-b border-kite-border">
                        {" "}
                        <div className="flex flex-col flex-1">
                          {" "}
                          <div className="flex items-center space-x-1.5 mb-1">
                            {" "}
                            <span className="font-normal text-kite-text text-[13px] md:text-[14px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide">
                              {investor.name?.toUpperCase()}
                            </span>{" "}
                            {investor.id === "admin_investor" && (
                              <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0" />
                            )}{" "}
                          </div>{" "}
                          <span className="font-sans text-[10px] md:text-[11px] ] text-gray-600 leading-tight">
                            {investor.investorId}
                          </span>{" "}
                        </div>{" "}
                        <div className="flex items-center space-x-3 md:space-x-6 text-right">
                          {" "}
                          <div className="flex flex-col items-end">
                            {" "}
                            <span className="font-normal text-kite-text text-[13px] md:text-[14px]">
                              {formatINR(totalAmountInvested)}
                            </span>{" "}
                            {totalAmountInvested > 0 && (
                              <span
                                className={`text-[11px] md:text-[12px] font-normal mt-0.5 ${returnPercentage >= 0 ? "text-kite-green" : "text-kite-red"}`}
                              >
                                {" "}
                                {returnPercentage >= 0 ? "+" : ""}
                                {returnPercentage.toFixed(2)}%{" "}
                              </span>
                            )}
                          </div>{" "}
                        </div>{" "}
                      </div>
                        {/* Desktop View */}
                        <div className="hidden md:flex items-center w-full px-4 border-b border-kite-border">
                          <div className="w-[30%] text-left py-3 flex items-center overflow-hidden pr-2">
                            <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                              {investor.name?.toUpperCase()}
                            </span>
                            {investor.id === "admin_investor" && (
                              <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0 ml-1.5" />
                            )}
                          </div>
                          <div className="w-[14%] text-left py-3 text-[12px] text-kite-text-light font-mono truncate pl-4 border-l border-kite-vertical-divider">
                            {investor.investorId}
                          </div>
                          <div className="w-[18%] text-right py-3 text-[13px] font-normal text-kite-text pr-4 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? `₹${formatLargeNumber(totalAmountInvested)}` : "NOT INVESTED"}
                          </div>
                          <div className="w-[16%] text-right py-3 text-[13px] pr-4 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? (
                              <span className={returnPercentage >= 0 ? "text-kite-green" : "text-kite-red"}>
                                {returnPercentage >= 0 ? "+" : ""}{returnPercentage.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-kite-text-light">NOT INVESTED</span>
                            )}
                          </div>
                          <div className="w-[22%] text-right py-3 text-[13px] font-normal pl-5 border-l border-kite-vertical-divider truncate">
                            {totalAmountInvested > 0 ? (
                               <span className={totalLiveProfit >= 0 ? "text-kite-green" : "text-kite-red"}>
                                  {totalLiveProfit >= 0 ? "+" : ""}₹{formatLargeNumber(totalLiveProfit)}
                               </span>
                            ) : (
                              <span className="text-kite-text-light">NOT INVESTED</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );})}{" "}
                  {filteredInvestors.length === 0 && (
                    <div className="p-8 text-center text-gray-600 font-normal text-[13px] md:text-[14px]">
                      No investors found.
                    </div>
                  )}{" "}
                </div>{" "}
                {/* Mobile Cards View */} <div className="hidden"> </div>{" "}
              </div>{" "}
            </div>{" "}
          </>
        )}{" "}
        {viewMode === "add-step-1" && (
          <div className="w-full max-w-xl mx-auto bg-transparent border-t md:border-t border-kite-border p-4 md:p-8 animate-fade-in mt-4 md:mt-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <div className="h-full bg-kite-blue w-1/2 transition-all duration-300"></div>
            </div>
            
            <div className="flex flex-col mb-6 pt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text uppercase">
                    Open account
                  </h3>
                  <p className="text-[13px] md:text-[14px] text-gray-500 font-normal mt-1">
                    Step 1 • Basic Profile
                  </p>
                </div>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6 border-b border-kite-border pb-4">
              <button
                type="button"
                className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-[14px] font-normal transition-all duration-200 rounded border ${ownerMode === "new" ? "bg-kite-blue text-white border-kite-blue" : "bg-white dark:bg-kite-surface text-gray-500 border-kite-border hover:bg-gray-50"}`}
                onClick={() => {
                  setOwnerMode("new");
                  setFormData({
                    ...formData,
                    name: "",
                    bankName: INDIAN_BANKS[0],
                    accountNumber: "",
                    ifscCode: "",
                    accountHolderName: "",
                    rmasServiceCharge: "",
                  });
                }}
              >
                New Investor
              </button>
              <button
                type="button"
                className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-[14px] font-normal transition-all duration-200 rounded border ${ownerMode === "existing" ? "bg-kite-blue text-white border-kite-blue" : "bg-white dark:bg-kite-surface text-gray-500 border-kite-border hover:bg-gray-50"}`}
                onClick={() => setOwnerMode("existing")}
              >
                Already Registered Owner
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormData({
                  ...formData,
                  accountHolderName:
                    formData.accountHolderName || formData.name.toUpperCase(),
                });
                setViewMode("add-step-2");
              }}
              className="space-y-6"
            >
              {ownerMode === "existing" && (
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                    placeholder="Search owner name..."
                    value={ownerSearch}
                    onChange={(e) => {
                      setOwnerSearch(e.target.value);
                      setShowOwnerSelect(true);
                    }}
                    onFocus={() => setShowOwnerSelect(true)}
                  />
                  {showOwnerSelect && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-kite-surface border border-kite-border rounded max-h-48 overflow-y-auto z-50 shadow-lg">
                      {Array.from(
                        new Set(state.businesses.map((b) => b.ownerName)),
                      )
                        .filter((name) =>
                          ((name as string) || "")
                            .toLowerCase()
                            .includes(ownerSearch.toLowerCase()),
                        )
                        .map((name, idx) => (
                          <div
                            key={idx}
                            className="p-3 hover:bg-gray-50 cursor-pointer text-kite-text font-normal uppercase text-[13px] md:text-[14px]"
                            onClick={() => {
                              const ownerBiz = state.businesses.find(
                                (b) => b.ownerName === name,
                              );
                              if (ownerBiz && ownerBiz.bankDetails) {
                                setFormData({
                                  ...formData,
                                  name: ownerBiz.ownerName,
                                  bankName: ownerBiz.bankDetails.bankName,
                                  accountNumber:
                                    ownerBiz.bankDetails.accountNumber,
                                  ifscCode: ownerBiz.bankDetails.ifscCode,
                                  accountHolderName:
                                    ownerBiz.bankDetails.accountHolderName,
                                });
                              } else if (ownerBiz) {
                                setFormData({
                                  ...formData,
                                  name: ownerBiz.ownerName,
                                });
                              }
                              setOwnerSearch(name);
                              setShowOwnerSelect(false);
                            }}
                          >
                            {name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Investor ID Number
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono text-gray-500 cursor-not-allowed outline-none"
                  value={formData.investorId}
                />
              </div>
              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  autoFocus={ownerMode === "new"}
                  readOnly={ownerMode === "existing"}
                  className={`w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal uppercase outline-none transition-colors ${ownerMode === "existing" ? "text-gray-500 cursor-not-allowed" : "text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      accountHolderName: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. Radhika Marchant"
                />
              </div>

              <div className="pt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("list");
                    setFormData({
                      name: "",
                      bankName: INDIAN_BANKS[0],
                      accountNumber: "",
                      ifscCode: "",
                      accountHolderName: "",
                      rmasServiceCharge: "",
                      investorId: generateId("INV"),
                    });
                  }}
                  className="text-gray-500 hover:text-kite-text transition-colors font-medium text-[13px] md:text-[14px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-kite-blue hover:bg-opacity-90 text-white px-6 py-2 rounded font-medium transition-colors text-[13px] md:text-[14px]"
                >
                  Next Step →
                </button>
              </div>
            </form>
          </div>
        )}
        {viewMode === "add-step-2" && (
          <div className="w-full max-w-xl mx-auto bg-transparent border-t md:border-t border-kite-border p-4 md:p-8 animate-fade-in mt-4 md:mt-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <div className="h-full bg-kite-blue w-full transition-all duration-300"></div>
            </div>

            <div className="flex flex-col mb-6 pt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text uppercase">
                    Link Bank Account
                  </h3>
                  <p className="text-[13px] md:text-[14px] text-gray-500 font-normal mt-1">
                    Step 2 • Banking Process & Fees
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("add-step-1")}
                  className="p-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifiedSave} className="space-y-6">
              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Bank Name
                </label>
                <select
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                >
                  {INDIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Account Number
                </label>
                <input
                  required
                  type="text"
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono text-kite-text focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="30291039482"
                />
              </div>

              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Bank IFSC Code
                </label>
                <input
                  required
                  type="text"
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono uppercase text-kite-text focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ifscCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SBIN0001234"
                />
              </div>

              <div>
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1">
                  Account Holder Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal uppercase text-kite-text focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountHolderName: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="pt-2">
                <label className="block text-[11px] md:text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-1 group-focus-within:text-kite-blue transition-colors">
                  Radhika Ma Service Charge (₹)
                </label>
                <input
                  required
                  type="text"
                  className="w-full border-0 border-b border-kite-border rounded-none px-0 py-2 bg-transparent text-[14px] md:text-[15px] font-medium text-kite-blue focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={formData.rmasServiceCharge}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    if (!raw) {
                      setFormData({ ...formData, rmasServiceCharge: "" });
                    } else {
                      const formatted = new Intl.NumberFormat("en-IN").format(
                        parseInt(raw),
                      );
                      setFormData({
                        ...formData,
                        rmasServiceCharge: formatted,
                      });
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <div className="pt-6 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setViewMode("add-step-1")}
                  disabled={isVerifying}
                  className="text-gray-500 hover:text-kite-text transition-colors font-medium text-[13px] md:text-[14px]"
                >
                  Back to Step 1
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-kite-blue hover:bg-opacity-90 disabled:opacity-50 text-white flex items-center justify-center space-x-2 py-3 md:py-3.5 rounded text-[13px] md:text-[14px] font-medium transition-colors h-[44px] md:h-[48px] relative"
                >
                  <span
                    className={`transition-opacity duration-300 ${isVerifying ? "opacity-0" : "opacity-100"}`}
                  >
                    Verify & Create Account
                  </span>
                  {isVerifying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </button>
              </div>
              </form>
          </div>
        )}
        {viewMode === "withdraw-list" &&
          selectedInvestor &&
          (() => {
            const sfProFont =
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

            const activeInvs = state.investments.filter(
              (i) =>
                i.investorId === selectedInvestor.id && i.status === "active",
            );
            const completedInvs = state.investments.filter(
              (i) =>
                i.investorId === selectedInvestor.id &&
                i.status === "completed",
            );

            const groupedActive = activeInvs.reduce(
              (acc, inv) => {
                if (!acc[inv.businessId]) acc[inv.businessId] = [];
                acc[inv.businessId].push(inv);
                return acc;
              },
              {} as Record<string, Investment[]>,
            );

            const groupedCompleted = completedInvs.reduce(
              (acc, inv) => {
                if (!acc[inv.businessId]) acc[inv.businessId] = [];
                acc[inv.businessId].push(inv);
                return acc;
              },
              {} as Record<string, Investment[]>,
            );

            let activeTotalInvested = 0;
            let activeTotalLiveProfit = 0;
            let activeTotalCurrentValue = 0;

            const holdings = Object.entries(groupedActive).map(
              ([bizId, invs]) => {
                const business = state.businesses.find((b) => b.id === bizId);
                const {
                  investedAmount,
                  liveTrendPercentage,
                  liveProfit,
                  currentValue,
                } = calculateLiveProfit(
                  invs as Investment[],
                  bizId,
                  marketState.trends,
                  state.settings,
                );
                activeTotalInvested += investedAmount;
                activeTotalLiveProfit += liveProfit;
                activeTotalCurrentValue += currentValue;
                return {
                  bizId,
                  business,
                  invs,
                  investedAmount,
                  liveProfit,
                  liveTrendPercentage,
                  currentValue,
                };
              },
            );

            const positions = Object.entries(groupedCompleted).map(
              ([bizId, invs]) => {
                const business = state.businesses.find((b) => b.id === bizId);
                let investedAmount = 0;
                (invs as Investment[]).forEach((inv: any) => {
                  investedAmount += inv.amount;
                });
                return { bizId, business, invs, investedAmount };
              },
            );

            // Fetch IPO Applications from localStorage
            const savedBidsApps = localStorage.getItem("bids_applications");
            const bidsApps = savedBidsApps ? JSON.parse(savedBidsApps).filter((a: any) => a.investorId === selectedInvestor.id) : [];
            const savedIpos = localStorage.getItem("bids_ipos");
            const allIpos = savedIpos ? JSON.parse(savedIpos) : [];
            // Active IPO apps (Not listed, not cancelled, not refunded)
            const activeBidsApps = bidsApps.filter((a: any) => 
               a.applicationStatus !== 'Cancelled' && 
               a.allotmentStatus !== 'Not Allotted' && 
               a.listingStatus !== 'Listed'
            );
            
            // History IPO apps (Refunded/Cancelled)
            const historyBidsApps = bidsApps.filter((a: any) => 
               a.applicationStatus === 'Cancelled' || 
               a.allotmentStatus === 'Not Allotted'
            );



            const curValue = activeTotalCurrentValue;
            const isProfit = curValue - activeTotalInvested >= 0;

            return (
              <div className="w-full bg-white dark:bg-kite-bg md:bg-transparent md:dark:bg-transparent md:mx-auto md:mt-8 animate-slide-in-mobile">
                {/* Header and Tabs */}
                <div className="bg-white dark:bg-kite-bg pt-4 px-4 md:px-6 relative z-10 border-b border-kite-border md:border-none">
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => setViewMode("investor-detail")}
                      className="text-kite-text-light hover:text-kite-text transition-colors mr-3 p-1 -ml-1 rounded-full hover:bg-kite-bg"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h2 className="text-[22px] md:text-[24px] font-bold text-kite-text tracking-tight flex items-center">
                      Portfolio
                      <span className="text-kite-text-light font-medium text-[13px] md:text-[14px] ml-3 mt-1 tracking-normal uppercase">
                        {selectedInvestor.name || ""}
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-6">
                    <button
                      className={`pb-3 text-[14px] md:text-[15px] transition-colors border-b-2 flex items-center gap-2 ${withdrawTab === "holdings" ? "border-kite-blue text-kite-blue font-medium" : "border-transparent text-kite-text-light hover:text-kite-text font-medium"}`}
                      onClick={() => setWithdrawTab("holdings")}
                    >
                      Holdings
                      <span className={`text-[11px] md:text-[12px] rounded-full px-2 py-0.5 ${withdrawTab === "holdings" ? "bg-kite-blue text-white" : "bg-kite-bg text-kite-text"}`}>
                        {holdings.length}
                      </span>
                    </button>
                    <button
                      className={`pb-3 text-[14px] md:text-[15px] transition-colors border-b-2 flex items-center gap-2 ${withdrawTab === "positions" ? "border-kite-blue text-kite-blue font-medium" : "border-transparent text-kite-text-light hover:text-kite-text font-medium"}`}
                      onClick={() => setWithdrawTab("positions")}
                    >
                      Positions
                      <span className={`text-[11px] md:text-[12px] rounded-full px-2 py-0.5 ${withdrawTab === "positions" ? "bg-kite-blue text-white" : "bg-kite-bg text-kite-text"}`}>
                        {positions.length}
                      </span>
                    </button>
                  </div>
                </div>

                {withdrawTab === "holdings" && (
                  <div className="bg-transparent md:bg-white md:dark:bg-kite-surface md:border-y md:border-kite-border">
                    {/* Desktop Table (Hidden on Mobile) */}
                    <div className="hidden md:block overflow-x-auto border-b border-kite-border">
                      <table className="w-full text-left text-[13px] md:text-[14px]">
                        <thead className="bg-white dark:bg-kite-surface border-b border-kite-border text-kite-text-light">
                          <tr>
                            <th className="py-3 px-4 font-normal text-left">Instrument</th>
                            <th className="py-3 px-4 font-normal text-right">Qty.</th>
                            <th className="py-3 px-4 font-normal text-right">Avg. cost</th>
                            <th className="py-3 px-4 font-normal text-right">LTP</th>
                            <th className="py-3 px-4 font-normal text-right">Cur. val</th>
                            <th className="py-3 px-4 font-normal text-right">P&L</th>
                            <th className="py-3 px-4 font-normal text-right">% Chg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-kite-border-soft bg-white dark:bg-kite-surface">
                          {holdings.length === 0 ? (
                            <tr>
                              <td colSpan={7}>
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                  <div className="text-gray-300 mb-4">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 font-medium text-[15px]">No active holdings found</p>
                                </div>
                              </td>
                            </tr>
                          ) : holdings.map((h, i) => {
                            const qty = (h.invs as Investment[]).length;
                            const avgPrice = h.investedAmount / qty;
                            const ltp = h.currentValue / qty;
                            const pnlPercent = h.investedAmount > 0 ? (h.liveProfit / h.investedAmount) * 100 : 0;
                            
                            return (
                              <tr
                                key={`desk_inv_h_${h.bizId}_${i}`}
                                className="hover:bg-gray-50/50 dark:hover:bg-[#202020] transition-colors cursor-pointer group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPortfolioInvestment({
                                    businessId: h.bizId,
                                    investorId: selectedInvestor.id,
                                    status: "active",
                                    timePeriodMonths: (h.invs as Investment[])[0].timePeriodMonths,
                                    interestRate: (h.invs as Investment[])[0].interestRate,
                                    startDate: (h.invs as Investment[])[0].startDate,
                                    endDate: (h.invs as Investment[])[0].endDate,
                                    amount: h.investedAmount,
                                    groupedInvestmentsList: h.invs as Investment[]
                                  });
                                }}
                              >
                                <td className="py-4 px-4 text-kite-text font-normal">{h.business?.name?.toUpperCase() || "UNKNOWN"}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{qty}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{avgPrice.toFixed(2)}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{ltp.toFixed(2)}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(h.currentValue)}</td>
                                <td className={`py-4 px-4 text-right font-normal ${h.liveProfit >= 0 ? "text-kite-green" : "text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {h.liveProfit >= 0 ? "+" : ""}
                                  {formatINR(h.liveProfit)}
                                </td>
                                <td className={`py-4 px-4 text-right font-normal ${h.liveProfit >= 0 ? "text-kite-green" : "text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {h.liveProfit >= 0 ? "+" : ""}
                                  {pnlPercent.toFixed(2)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      {/* Desktop Holdings Summary */}
                      {holdings.length > 0 && (
                        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-kite-bg border-t border-kite-border">
                          <div className="flex space-x-16">
                            <div>
                              <p className="text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Total investment</p>
                              <p className="text-[16px] text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(activeTotalInvested)}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Current value</p>
                              <p className="text-[16px] text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(curValue)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Total P&L</p>
                            <div className="flex items-center justify-end space-x-2">
                                <span className={`text-[16px] font-medium ${isProfit ? "text-kite-green" : "text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {isProfit ? "+" : ""}{formatINR(activeTotalLiveProfit)}
                                </span>
                                <span className={`text-[12px] font-medium px-2 py-0.5 rounded-sm ${isProfit ? "bg-kite-green/10 text-kite-green" : "bg-kite-red/10 text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {isProfit ? "+" : ""}{activeTotalInvested > 0 ? ((activeTotalLiveProfit / activeTotalInvested) * 100).toFixed(2) : "0.00"}%
                                </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Holdings List (Matches Kite App) */}
                    <div className="block md:hidden">
                      {holdings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                          <div className="text-gray-300 mb-4">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium text-[15px]">No active holdings found</p>
                        </div>
                      ) : (
                        <>
                          {/* Kite Style Top Summary Card - Full Width on Mobile */}
                          <div className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-[12px] text-kite-text-light mb-1">Invested</p>
                                <p className="text-[18px] text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(activeTotalInvested).replace("₹", "")}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[12px] text-kite-text-light mb-1">Current</p>
                                <p className="text-[18px] text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(curValue).replace("₹", "")}</p>
                              </div>
                            </div>
                            <div className="h-[1px] w-full bg-kite-border-soft mb-4"></div>
                            <div className="flex justify-between items-center">
                              <p className="text-[14px] text-kite-text-light">P&L</p>
                              <div className="flex items-center space-x-2">
                                <span className={`text-[16px] font-normal ${isProfit ? "text-kite-green" : "text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {isProfit ? "+" : ""}{formatINR(activeTotalLiveProfit).replace("₹", "")}
                                </span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded-sm ${isProfit ? "bg-kite-green/10 text-kite-green" : "bg-kite-red/10 text-kite-red"}`} style={{ fontFamily: sfProFont }}>
                                  {isProfit ? "+" : ""}{activeTotalInvested > 0 ? ((activeTotalLiveProfit / activeTotalInvested) * 100).toFixed(2) : "0.00"}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Kite Style List */}
                          <div className="bg-transparent">
                            {holdings.map((h, i) => {
                              const qty = (h.invs as Investment[]).length;
                              const avgPrice = h.investedAmount / qty;
                              const ltp = h.currentValue / qty;
                              const pnlPercent = h.investedAmount > 0 ? (h.liveProfit / h.investedAmount) * 100 : 0;
                              
                              return (
                                <div 
                                  key={`mob_inv_h_${h.bizId}_${i}`} 
                                  className="px-4 py-3 border-b border-kite-border-soft md:hover:bg-gray-50 dark:md:hover:bg-[#202020] transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPortfolioInvestment({
                                      businessId: h.bizId,
                                      investorId: selectedInvestor.id,
                                      status: "active",
                                      timePeriodMonths: (h.invs as Investment[])[0].timePeriodMonths,
                                      interestRate: (h.invs as Investment[])[0].interestRate,
                                      startDate: (h.invs as Investment[])[0].startDate,
                                      endDate: (h.invs as Investment[])[0].endDate,
                                      amount: h.investedAmount,
                                      groupedInvestmentsList: h.invs as Investment[]
                                    });
                                  }}
                                >
                                  {/* Line 1: Metrics Row (Qty & Avg) */}
                                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                                    <div className="flex items-center text-[11px] md:text-[12px]">
                                       <span className="text-kite-text-light font-normal mr-1">Qty.</span>
                                       <span className="text-kite-text font-normal tracking-wide">{qty}</span>
                                       <span className="text-kite-text-light mx-1.5">•</span>
                                       <span className="text-kite-text-light font-normal mr-1">Avg.</span>
                                       <span className="text-kite-text font-normal tracking-wide">{avgPrice.toFixed(2)}</span>
                                    </div>
                                    <div className={`text-[11px] md:text-[12px] font-normal ${pnlPercent >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                                      {pnlPercent >= 0 ? "+" : ""} {pnlPercent.toFixed(2)}%
                                    </div>
                                  </div>
                                  
                                  {/* Line 2: Core Business Name & Absolute P&L Row */}
                                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                                     <div className="flex items-center gap-1.5">
                                        <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                           {h.business?.name?.toUpperCase() || "UNKNOWN"}
                                        </h3>
                                     </div>
                                     <div className={`text-[13px] md:text-[14px] font-normal ${h.liveProfit >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                                       {h.liveProfit >= 0 ? "+" : ""}
                                       {formatINR(Math.abs(h.liveProfit)).replace("₹", "")}
                                     </div>
                                  </div>
                                  
                                  {/* Line 3: Footer Row (Investor Info & LTP) */}
                                  <div className="flex justify-between items-center leading-tight">
                                     <div className="flex items-center text-[10px] md:text-[11px]">
                                     <span className="text-kite-text-light font-normal mr-1">Invested:</span>
                                       <span className="text-kite-text font-normal uppercase tracking-wide">{formatINR(h.investedAmount).replace("₹", "")}</span>
                                     </div>
                                     <div className="flex items-center text-[11px] md:text-[12px]">
                                       <span className="text-kite-text-light font-normal mr-1">LTP</span>
                                       <span className="text-kite-text font-normal tracking-wide">{ltp.toFixed(2)}</span>
                                       <span className={`ml-1 ${h.liveTrendPercentage >= 0 ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                                         ({h.liveTrendPercentage >= 0 ? "+" : ""}{h.liveTrendPercentage.toFixed(2)}%)
                                       </span>
                                     </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                          {/* Active IPO Apps on Mobile */}
                          {activeBidsApps.map((app: any) => {
                             const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                             let displayStatus = 'IPO APPLIED';
                             if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                             return (
                              <div key={app.id} className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                   <div className="flex items-center gap-1.5">
                                      <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                         {ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}
                                      </h3>
                                   </div>
                                   <div className="text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium bg-kite-blue/10 text-kite-blue">
                                     {displayStatus}
                                   </div>
                                </div>
                                <div className="flex justify-between items-center leading-tight">
                                   <div className="flex items-center text-[10px] md:text-[11px]">
                                     <span className="text-kite-text-light font-normal mr-1">Invested:</span>
                                     <span className="text-kite-text font-normal uppercase tracking-wide">{formatINR(app.appliedAmount).replace("₹", "")}</span>
                                   </div>
                                </div>
                              </div>
                             );
                          })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {withdrawTab === "positions" && (
                  <div className="bg-transparent md:bg-white md:dark:bg-kite-surface md:border-y md:border-kite-border">
                    {/* Desktop Table (Hidden on Mobile) */}
                    <div className="hidden md:block overflow-x-auto border-b border-kite-border">
                      <table className="w-full text-left text-[13px] md:text-[14px]">
                        <thead className="bg-white dark:bg-kite-surface border-b border-kite-border text-kite-text-light">
                          <tr>
                            <th className="py-3 px-4 font-normal text-left">Instrument</th>
                            <th className="py-3 px-4 font-normal text-right">Qty.</th>
                            <th className="py-3 px-4 font-normal text-right">Avg. price</th>
                            <th className="py-3 px-4 font-normal text-right">Invested</th>
                            <th className="py-3 px-4 font-normal text-center w-24">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-kite-border-soft bg-white dark:bg-kite-surface">
                          {positions.length === 0 ? (
                            <tr>
                              <td colSpan={5}>
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                  <div className="text-gray-300 mb-4">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 font-medium text-[15px]">No active positions found</p>
                                </div>
                              </td>
                            </tr>
                          ) : positions.map((p, i) => {
                            const qty = (p.invs as Investment[]).length;
                            const avgPrice = p.investedAmount / qty;
                            return (
                              <tr
                                key={`desk_inv_p_${p.bizId}_${i}`}
                                className="hover:bg-gray-50/50 dark:hover:bg-[#202020] transition-colors cursor-pointer group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPortfolioInvestment({
                                    businessId: p.bizId,
                                    investorId: selectedInvestor.id,
                                    status: "completed",
                                    timePeriodMonths: (p.invs as Investment[])[0].timePeriodMonths,
                                    interestRate: (p.invs as Investment[])[0].interestRate,
                                    startDate: (p.invs as Investment[])[0].startDate,
                                    endDate: (p.invs as Investment[])[0].endDate,
                                    amount: p.investedAmount,
                                    groupedInvestmentsList: p.invs as Investment[]
                                  });
                                }}
                              >
                                <td className="py-4 px-4 text-kite-text font-normal">{p.business?.name?.toUpperCase() || "UNKNOWN"}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{qty}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{avgPrice.toFixed(2)}</td>
                                <td className="py-4 px-4 text-right text-kite-text font-normal" style={{ fontFamily: sfProFont }}>{formatINR(p.investedAmount)}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className="bg-kite-blue/10 text-kite-blue px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">Closed</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {historyBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6">
                          <thead className="bg-white dark:bg-kite-surface border-y border-kite-border text-kite-text-light">
                            <tr>
                              <th className="font-normal py-3 px-4 md:px-6 w-[30%]">IPO APPLIED</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[20%]">AMOUNT</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[30%]">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyBidsApps.map((app: any) => {
                               const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                               const isRefunded = app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted';
                               const isListed = app.listingStatus === 'Listed';
                               if (isListed) return null; // handled by normal investments

                               let displayStatus = 'IPO APPLIED';
                               if (isRefunded) displayStatus = 'REFUNDED';
                               else if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                               return (
                                 <tr key={app.id} className="border-b border-kite-border hover:bg-gray-50 dark:hover:bg-[#202020]">
                                   <td className="py-3 px-4 md:px-6">
                                     <div className="flex items-center gap-2">
                                       <span className="text-kite-text font-normal uppercase tracking-wide">{ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}</span>
                                     </div>
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal text-kite-text">
                                     {formatINR(app.appliedAmount).replace("₹", "")}
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal">
                                      <span className={`text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium ${isRefunded ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'bg-kite-blue/10 text-kite-blue'}`}>
                                        {displayStatus}
                                      </span>
                                   </td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                        )}
                        {activeBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6 border-t border-kite-border">
                          <thead className="bg-white dark:bg-kite-surface border-b border-kite-border text-kite-text-light">
                            <tr>
                              <th className="font-normal py-3 px-4 md:px-6 w-[30%]">ACTIVE IPO</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[20%]">AMOUNT</th>
                              <th className="font-normal py-3 px-4 md:px-6 text-right w-[30%]">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBidsApps.map((app: any) => {
                               const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                               let displayStatus = 'IPO APPLIED';
                               if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';
                               return (
                                 <tr key={app.id} className="border-b border-kite-border hover:bg-gray-50 dark:hover:bg-[#202020]">
                                   <td className="py-3 px-4 md:px-6">
                                     <div className="flex items-center gap-2">
                                       <span className="text-kite-text font-normal uppercase tracking-wide">{ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}</span>
                                     </div>
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal text-kite-text">
                                     {formatINR(app.appliedAmount).replace("₹", "")}
                                   </td>
                                   <td className="py-3 px-4 md:px-6 text-right font-normal">
                                      <span className="text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium bg-kite-blue/10 text-kite-blue">
                                        {displayStatus}
                                      </span>
                                   </td>
                                 </tr>
                               );
                            })}
                          </tbody>
                        </table>
                        )}
                    </div>

                    {/* Mobile Positions List */}
                    <div className="block md:hidden">
                      {positions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                          <div className="text-gray-300 mb-4">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium text-[15px]">No active positions found</p>
                        </div>
                      ) : (
                        <div className="bg-transparent">
                          {positions.map((p, i) => {
                            const qty = (p.invs as Investment[]).length;
                            const avgPrice = p.investedAmount / qty;
                            
                            return (
                              <div 
                                key={`mob_inv_p_${p.bizId}_${i}`} 
                                className="px-4 py-3 border-b border-kite-border-soft md:hover:bg-gray-50 dark:md:hover:bg-[#202020] transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPortfolioInvestment({
                                    businessId: p.bizId,
                                    investorId: selectedInvestor.id,
                                    status: "completed",
                                    timePeriodMonths: (p.invs as Investment[])[0].timePeriodMonths,
                                    interestRate: (p.invs as Investment[])[0].interestRate,
                                    startDate: (p.invs as Investment[])[0].startDate,
                                    endDate: (p.invs as Investment[])[0].endDate,
                                    amount: p.investedAmount,
                                    groupedInvestmentsList: p.invs as Investment[]
                                  });
                                }}
                              >
                                {/* Line 1: Metrics Row (Qty & Avg) */}
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                  <div className="flex items-center text-[11px] md:text-[12px]">
                                     <span className="text-kite-text-light font-normal mr-1">Qty.</span>
                                     <span className="text-kite-text font-normal tracking-wide">{qty}</span>
                                     <span className="text-kite-text-light mx-1.5">•</span>
                                     <span className="text-kite-text-light font-normal mr-1">Avg.</span>
                                     <span className="text-kite-text font-normal tracking-wide">{avgPrice.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[11px] text-[#4CAF50] bg-[#4CAF50]/10 px-1.5 py-0.5 rounded tracking-wide uppercase font-medium">
                                    Closed
                                  </div>
                                </div>
                                
                                {/* Line 2: Core Business Name & Absolute P&L Row */}
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                   <div className="flex items-center gap-1.5">
                                      <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                         {p.business?.name?.toUpperCase() || "UNKNOWN"}
                                      </h3>
                                   </div>
                                   <div className="text-[13px] md:text-[14px] font-normal text-kite-text">
                                     {formatINR(p.investedAmount).replace("₹", "")}
                                   </div>
                                </div>
                                
                                {/* Line 3: Footer Row (Investor Info) */}
                                <div className="flex justify-between items-center leading-tight">
                                   <div className="flex items-center text-[10px] md:text-[11px]">
                                     <span className="text-kite-text-light font-normal mr-1">Invested:</span>
                                     <span className="text-kite-text font-normal uppercase tracking-wide">{formatINR(p.investedAmount).replace("₹", "")}</span>
                                   </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* IPO Apps on Mobile */}
                          {historyBidsApps.map((app: any) => {
                             const ipo = allIpos.find((i: any) => i.id === app.ipoId);
                             const isRefunded = app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted';
                             const isListed = app.listingStatus === 'Listed';
                             if (isListed) return null;

                             let displayStatus = 'IPO APPLIED';
                             if (isRefunded) displayStatus = 'REFUNDED';
                             else if (app.allotmentStatus === 'Allotted') displayStatus = 'IPO ALLOTTED';

                             return (
                              <div key={app.id} className="bg-transparent px-4 py-4 border-b border-kite-border-soft">
                                <div className="flex justify-between items-center mb-1.5 leading-tight">
                                   <div className="flex items-center gap-1.5">
                                      <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                                         {ipo?.companyName?.toUpperCase() || 'UNKNOWN IPO'}
                                      </h3>
                                   </div>
                                   <div className={`text-[11px] px-1.5 py-0.5 rounded tracking-wide uppercase font-medium ${isRefunded ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'bg-kite-blue/10 text-kite-blue'}`}>
                                     {displayStatus}
                                   </div>
                                </div>
                                <div className="flex justify-between items-center leading-tight">
                                   <div className="flex items-center text-[10px] md:text-[11px]">
                                     <span className="text-kite-text-light font-normal mr-1">Invested:</span>
                                     <span className="text-kite-text font-normal uppercase tracking-wide">{formatINR(app.appliedAmount).replace("₹", "")}</span>
                                   </div>
                                </div>
                              </div>
                             );
                          })}

                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        {viewMode === "withdraw-calc" &&
          selectedInvestor &&
          selectedInvestments.length > 0 && (
            <div className="p-4 md:p-6 w-full bg-white dark:bg-kite-surface border border-kite-border rounded-sm mt-4 md:mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b border-kite-border pb-4">
                <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text uppercase">
                  Withdrawal Calculation
                </h3>
                <button
                  onClick={() => setViewMode("withdraw-list")}
                  className="text-gray-700 hover:text-gray-700 font-medium text-[13px] md:text-[14px]"
                >
                  Back
                </button>
              </div>
              <form onSubmit={goToBanking} className="space-y-4">
                <div className="text-[13px] md:text-[14px] text-kite-text">
                  Please review calculation details before proceeding to bank
                  transfer.
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium text-[13px] md:text-[14px]"
                  >
                    Proceed to Bank Transfer →
                  </button>
                </div>
              </form>
            </div>
          )}
        {viewMode === "withdraw-bank" &&
          selectedInvestor &&
          selectedInvestments.length > 0 && (
            <div className="p-4 md:p-6 w-full bg-white dark:bg-kite-surface border border-kite-border rounded-sm mt-4 md:mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b border-kite-border pb-4">
                <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text uppercase">
                  Bank Transfer Confirmation
                </h3>
                <button
                  onClick={() => setViewMode("withdraw-calc")}
                  className="text-gray-700 hover:text-gray-700 font-medium text-[13px] md:text-[14px]"
                >
                  Back
                </button>
              </div>
              <div className="space-y-4">
                <div className="text-[13px] md:text-[14px] text-kite-text">
                  Confirm that funds have been successfully transferred to the
                  investor's bank account.
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      handlePay();
                      setViewMode("list");
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium text-[13px] md:text-[14px]"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        {viewMode === "banking-record" && selectedInvestor && (
          <div className="p-4 md:p-6 w-full bg-white dark:bg-kite-surface border border-kite-border rounded-sm mt-4 md:mt-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-kite-border pb-4">
              <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text uppercase">
                Banking Records
              </h3>
              <button
                onClick={() => setViewMode("list")}
                className="text-gray-700 hover:text-gray-700 font-medium text-[13px] md:text-[14px]"
              >
                Back to List
              </button>
            </div>
            <div className="space-y-4">
              {state.investments
                .filter(
                  (i) =>
                    i.investorId === selectedInvestor.id &&
                    i.status === "completed",
                )
                .map((inv, i) => {
                  const business = state.businesses.find(
                    (b) => b.id === inv.businessId,
                  );
                  const payout = inv.payoutDetails;
                  return (
                    <div
                      key={`inv_pos_${inv.id}_${i}`}
                      className="p-4 border border-kite-border rounded-sm flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div>
                        <h4 className="font-normal text-[13px] md:text-[14px] text-kite-text uppercase mb-1">
                          {business?.name?.toUpperCase() || "UNKNOWN"}
                        </h4>
                        <p className="text-[12px] md:text-[13px] font-mono text-gray-600">
                          Inv. ID: #{inv.id}
                        </p>
                        <p className="text-[12px] md:text-[13px] text-gray-600">
                          Paid on:{" "}
                          {payout?.payoutDate
                            ? new Date(payout.payoutDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-[11px] md:text-[12px] text-gray-600 uppercase tracking-widest">
                          Credited
                        </p>
                        <p className="font-normal text-[13px] md:text-[14px] text-kite-green">
                          {formatINR(payout?.totalCredited || 0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {state.investments.filter(
                (i) =>
                  i.investorId === selectedInvestor.id &&
                  i.status === "completed",
              ).length === 0 && (
                <div className="text-center py-12 text-gray-600 bg-kite-bg border border-kite-border border-dashed rounded-sm">
                  <p className="font-normal text-[13px] md:text-[14px] text-kite-text">
                    No completed banking records found.
                  </p>
                  <p className="text-[12px] md:text-[13px] mt-1">
                    When an investment is withdrawn, the profit slip will appear
                    here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* --- Profit Slip Modal --- */}{" "}
      {pdfProfitSlip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/70 p-4 print:hidden">
          {" "}
          <div className="bg-white dark:bg-kite-surface rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
            {" "}
            <div className="sticky top-0 bg-white dark:bg-kite-surface border-b border-kite-border p-4 flex justify-between items-center z-10">
              {" "}
              <h3 className="font-normal text-[11px] md:text-[12px] text-kite-text flex items-center space-x-2">
                {" "}
                <CheckCircle className="text-kite-green" />{" "}
                <span>Withdrawal Successful & Profit Slip Generated</span>{" "}
              </h3>{" "}
              <div className="flex items-center space-x-3">
                {" "}
                <button className="font-medium">
                  {" "}
                  <Download className="w-3 md:w-4 h-3 md:h-4" />{" "}
                  <span>Download / Print Slip</span>{" "}
                </button>{" "}
                <button
                  onClick={() =>
                    setPdfInvestor(pdfProfitSlip?.investor || selectedInvestor)
                  }
                  className="text-[13px] md:text-[14px] font-medium text-kite-text hover:text-kite-blue"
                >
                  Preview PDF Document
                </button>{" "}
                <div className="flex items-center space-x-3">
                  {" "}
                  <button className="font-medium">
                    {" "}
                    <Download className="w-3 md:w-4 h-3 md:h-4" />{" "}
                    <span>Download / Print</span>{" "}
                  </button>{" "}
                  <button
                    onClick={() => setPdfInvestor(null)}
                    className="p-2 hover:bg-kite-bg rounded-full text-gray-600"
                  >
                    {" "}
                    <X className="w-4 h-4 md:w-5 md:h-5" />{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {/* Provide a visual boundary for the user before printing */}{" "}
              <div className="bg-white dark:bg-kite-surface rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {" "}
                <div
                  id="investor-pdf-content"
                  className="bg-white dark:bg-kite-surface border border-kite-border mx-auto max-w-3xl p-4 md:p-8 aspect-auto text-kite-text"
                >
                  {" "}
                  {/* We just show a preview here, the actual printable content is below */}{" "}
                  <PdfContent investor={pdfInvestor} />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* --- ACTUAL PRINTABLE CONTENT --- */}{" "}
      {/* This is completely hidden from the screen, and only formatted nicely for print. */}{" "}
      {pdfInvestor && (
        <div className="hidden print:block font-sans text-kite-text p-0 m-0">
          {" "}
          <PdfContent investor={pdfInvestor} />{" "}
        </div>
      )}{" "}
      {selectedPortfolioInvestment && (
        <LivePortfolioDetail
          selectedInvestment={selectedPortfolioInvestment}
          onClose={() => setSelectedPortfolioInvestment(null)}
        />
      )}
    </div>
  );
} // Sub-component for the PDF Content to ensure it's rendered identically in Preview and Print
function PdfContent({ investor }: { investor: Investor }) {
  return (
    <div className="space-y-4 sm:space-y-8 leading-relaxed">
      {" "}
      <div className="text-center space-y-1 sm:space-y-2 border-b-2 border-black pb-3 sm:pb-3 sm:pb-6 mb-4 sm:mb-4 md:mb-8">
        {" "}
        <h1 className="text-[13px] md:text-[14px] font-normal tracking-widest text-kite-text">
          RADHIKA MA SERVICE
        </h1>{" "}
        <h2 className="text-[15px] md:text-[16px] font-normal text-kite-text mt-2">
          INVESTMENT SERVICE GUIDELINES RULES
        </h2>{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {" "}
        <div>
          {" "}
          <p className="text-[13px] md:text-[14px] font-normal text-gray-600 uppercase tracking-wide">
            Investor Details
          </p>{" "}
          <p className="font-normal text-[11px] md:text-[12px] mt-1 text-kite-text">
            {investor.name?.toUpperCase()}
          </p>{" "}
          <p className="font-mono text-[13px] md:text-[14px] text-gray-600 mt-0.5">
            ID: #{investor.investorId}
          </p>{" "}
          <p className="text-[13px] md:text-[14px] text-gray-600 mt-0.5">
            Joined: {new Date(investor.joinDate).toLocaleDateString("en-IN")}
          </p>{" "}
        </div>{" "}
        {investor.bankDetails && (
          <div>
            {" "}
            <p className="text-[13px] md:text-[14px] font-normal text-gray-600 uppercase tracking-wide">
              Banking Profile
            </p>{" "}
            <p className="font-normal text-kite-text mt-1">
              {investor.bankDetails.bankName}
            </p>{" "}
            <p className="font-mono text-[13px] md:text-[14px] text-gray-600 mt-0.5">
              A/C: {investor.bankDetails.accountNumber}
            </p>{" "}
            <p className="font-mono text-[13px] md:text-[14px] text-gray-600 mt-0.5">
              IFSC: {investor.bankDetails.ifscCode}
            </p>{" "}
            <p className="text-[11px] md:text-[12px] font-normal text-gray-600 mt-1">
              ACCOUNT HOLDER: {investor.bankDetails.accountHolderName}
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className="space-y-2 sm:space-y-5 text-justify text-[11px] md:text-[12px]">
        {" "}
        <p>
          {" "}
          <strong>RADHIKA MARCHANT ACOOUNT SERVICE</strong> માં જોડાયા બદલ
          તમારું સ્વાગત છે તમે અમારે ત્યાં બસ્સીનેસ કરતા વ્યક્તિ ને ઇન્વેસ્ટ કરી
          ને તેમનો બસ્સીનેસ આગળ લાવવા માં મદદ કરી તે બદલ હું રાધિક મર્ચન્ટ
          અંબાણી તમને અભિનંદન પાઠવું છું.{" "}
        </p>{" "}
        <p>
          {" "}
          અમારે ત્યાં તમે જે કંપની માં ઇન્વેસ્ટ કરવા માંગો છો તે તમામ કંપની
          અમારે ત્યાં <strong>HAPPY MUSLIM INCOME TAX</strong> દ્વારા અને{" "}
          <strong>ABDULJI BHAI PATHAN</strong> દ્વારા દલાલી આપી ત્યારબાદ નોંધ લઈ
          ને અને <strong>TAX</strong> રજિસ્ટર માન્ય ગણી ને અમારા{" "}
          <strong>RADHIKA MARCHANT ACCOUNT SERVICE</strong> માં{" "}
          <strong>VERFIED</strong> કરવાની પરવાનગી અમે આપીએ છીએ.{" "}
        </p>{" "}
        <p>
          {" "}
          <strong>RADHIKA MA SERVICE</strong> દરમિયાન અમે માત્ર અમારે ત્યાં
          રજિસ્ટર થયેલ બસ્સીનેસ માં જ ઇન્વેસ્ટ કરવાની પરવાનગી આપીએ છીએ જોવા તમે
          પર્સનલી રીતે વાત ચીત કરીને અથવા અન્ય અમારી કંપની શિવાય ના એજન્ટ અથવા
          વ્યક્તિ ની સલાહ લઈ ને જો ઇન્વેસ્ટ કરો છો ત્યાર બાદ કોઈ છેતરપિંડી થાઈ
          તો તે બદલ <strong>RMAS</strong> તેમાં કોઈ રીતે જવાબદાર ગણાતી નથી.{" "}
        </p>{" "}
        <p>
          {" "}
          તમારા ઇન્વેસ્ટમેન્ટ દરમિયાન જે કઈ લેણદેણ થાઈ તે તમારા બેંક અકાઉંટ
          દ્વારા જ કરવામાં આવશે અન્યતા કોઈ રોકડ વ્યવહાર કરવામાં આવશે નહીં જેથી
          તમામ અમોઉન્ટ ઉપર ફરજિયાત હુકમ કરીને <strong>
            HAPPY MUSLIM TAX
          </strong>{" "}
          લાગુ પડે છે જેથી સરકાર દ્વારા ગાઇડલાઇન્સ અનુસરવી જરૂરી છે ઇન્વેસ્ટર્સ
          ને.{" "}
        </p>{" "}
        <p>
          {" "}
          આ ઇન્વેસ્ટમેન્ટ માં તમે જે બસ્સીનેસ માં ઇન્વેસ્ટ કર્યા તેની તમામ બેસિક
          ડિટેઇસ અથવા પૂરી જાણકારી તમને અમારી ટીમ સાથે{" "}
          <strong>RADHIK MADUM</strong> દ્વારા આપવામાં આવી ત્યાર બાદ તમે પસંદ
          કરેલ બસ્સીનેસ કંપની માં ઇન્વેસ્ટ કરવાનું પસંદ કરેલ છે ત્યાર બાદ તમારું
          ઇન્વેસ્ટમેન્ટ કરેલ અમોઉન્ટ તે બસ્સીનેસમેન સુધી 24 કલાક માં અમે પોહચાડી
          દઈએ છીએ અને તમે અનુશ્રિત સમય મુજબ કંપની જેટલું કમાણી કરે છે તે અમને
          રેકોર્ડ ડેટા અમારા સુધી આવે તે મુજબ અમે તમને તમે પસંદ કરેલ ઇન્ટરેસ્ટ
          મુજબ તમારા બેન્ક અકાઉંટ માં પરત કરીશું.{" "}
        </p>{" "}
        <p>
          {" "}
          જો તમે કોઈ કંપની માં ઇન્વેસ્ટ કરો છો તો તમે અન્ય બીજી કંપની માં અથવા
          એને એજ કંપની માં પરત ઇન્વેસ્ટ કરવાનું વિચારો છો તે બિલકુલ સક્ય છે તમે
          બિન્દાસ તમે ઇન્વેસ્ટ કરી શકો છો.{" "}
        </p>{" "}
      </div>{" "}
      <div className="mt-4 sm:mt-4 sm:mt-4 md:mt-8 bg-kite-bg border border-black p-3 sm:p-4 rounded">
        {" "}
        <h4 className="font-normal text-[11px] md:text-[12px] text-kite-text mb-4 pb-2 border-b border-kite-border">
          : ખાસ નોંધ :
        </h4>{" "}
        <p className="mb-4 text-justify">
          {" "}
          જો તમે કોઈ બસ્સીનેસ માં ઇન્વેસ્ટ કરો છો તે કોઈ આર્થિક રીતે તે સમય મુજબ
          તેટલું ઇન્વેસ્ટ નથી કરી શકતું તો તેના માટે મુખ્ય તબકા 2 રહશે જેમાં
          તમને પર્સનલી કોન્ટેટ કરીને ને જાણકારી લઈ ને અમે તે પગલું ભરીસું. 99%
          અમારી કંપની માં રજિસ્ટર થયેલ BUSSINESS આર્થિક રીતે મજબૂત જ બને છે અન્ય
          કોઈ કારણોસર થાઈ તે બદલ તમને જાણકારી આપવી અમારી ફરજ છે.{" "}
        </p>{" "}
        <ol className="list-decimal pl-6 space-y-4 text-justify">
          {" "}
          <li>
            {" "}
            <span className="font-normal text-kite-text">
              જો કંપની આર્થિક રીતે તમારા સમયગાળા મુજબ તમે નક્કી કરેલ
              ઇન્વેસ્ટમેન્ટ જાહેર નથી કરી શકતું
            </span>{" "}
            તો શું તમે તે સમય પીરિયડ લંબાવા માંગો છો? જો માંગતા હોય તો અમે સમય
            ગાળો લંબાવી દઈશું અને તે કારણોસર તમને તે બસ્સીનેસ દરમિયાન અમુક ટકા
            ઇન્ટરેસ્ટ વધારી ને પણ આપીએ છીએ.{" "}
          </li>{" "}
          <li>
            {" "}
            <span className="font-normal text-kite-text">
              જો તમારા ટાઈમ પીરિયડ દરમિયાન જો તમે ઇન્વેસ્ટ કરેલ અમોઉન્ટ તમને
              તાત્કાલિક રૂપે જરૂર હોય
            </span>{" "}
            અને બસ્સીનેસ કંપની ને આર્થિક સ્થિત ઉપર ના આવી હોય તો અમારી ટીમ તમને
            તમે રોકેલ વળતર પાછું આપીસુ જે તમે ઇન્ટરેસ્ટ રેટ મુજબ નક્કી કરેલ હતું
            તે સાથે જે તમને RMAS કંપની પૂરું પાડશે જેથી તમને અમારી કંપની ઉપર
            કાયમ વિશ્વાસ રહે અને ફરીથી ઇન્વેસ્ટ કરવામાં અનુસૂચિત બનો.{" "}
          </li>{" "}
        </ol>{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {" "}
        <div>
          {" "}
          <div className="border-b border-kite-border w-48 mx-auto mb-2 h-12"></div>{" "}
          <p className="font-normal">Authorized Signatory</p>{" "}
          <p className="text-[13px] md:text-[14px] font-normal text-gray-600">
            RADHIKA MA SERVICE
          </p>{" "}
        </div>{" "}
        <div>
          {" "}
          <div className="border-b border-kite-border w-48 mx-auto mb-2 h-12"></div>{" "}
          <p className="font-normal">Investor Signature</p>{" "}
          <p className="text-[13px] md:text-[14px] font-normal text-gray-600">
            {investor.name?.toUpperCase()}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
} // Component for the Profit Slip
function ProfitSlipContent({
  investment,
  investor,
  business,
  isBlueTick,
  isPreVerified,
}: {
  investment: Investment;
  investor: Investor;
  business: Business;
  isBlueTick?: boolean;
  isPreVerified?: boolean;
}) {
  const payout = investment.payoutDetails;
  return (
    <div className="space-y-4 sm:space-y-8 leading-relaxed">
      {" "}
      <div className="absolute top-10 right-10 opacity-10">
        {" "}
        <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />{" "}
      </div>{" "}
      <div className="border-b-4 border-black pb-3 sm:pb-6">
        {" "}
        <h1 className="text-[15px] md:text-[16px] font-normal uppercase tracking-tighter">
          Radhika Ma Service
        </h1>{" "}
        <h2 className="text-[15px] md:text-[16px] font-normal tracking-widest text-gray-600 mt-1">
          OFFICIAL PROFIT SETTLEMENT SLIP
        </h2>{" "}
      </div>{" "}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {" "}
        <div>
          {" "}
          <p className="text-[11px] md:text-[12px] font-normal uppercase tracking-widest text-gray-600 mb-1">
            Investor Information
          </p>{" "}
          <p className="font-normal text-[11px] md:text-[12px] uppercase">
            {investor.name?.toUpperCase()}
          </p>{" "}
          <p className="text-[13px] md:text-[14px] font-mono mt-1 text-gray-600">
            ID: #{investor.investorId}
          </p>{" "}
          <p className="text-[13px] md:text-[14px] font-normal mt-2">
            Credited Bank:{" "}
            <span className="font-mono">
              {investor.bankDetails.bankName} (...
              {investor.bankDetails.accountNumber.slice(-4)})
            </span>
          </p>{" "}
        </div>{" "}
        <div>
          {" "}
          <p className="text-[11px] md:text-[12px] font-normal uppercase tracking-widest text-gray-600 mb-1">
            Business Source
          </p>{" "}
          <div className="flex items-center space-x-2">
            {" "}
            <p className="font-normal text-[11px] md:text-[12px] uppercase">
              {business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}
            </p>{" "}
            {isBlueTick && (
              <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />
            )}{" "}
            {isPreVerified && (
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-black" />
            )}{" "}
          </div>{" "}
          <p className="text-[13px] md:text-[14px] text-gray-600 mt-1 uppercase">
            Owner: {business.ownerName}
          </p>{" "}
          <p className="text-[13px] md:text-[14px] font-mono mt-1 text-gray-600">
            Bus. ID: #{business.businessId}
          </p>{" "}
          {business.authorityType &&
            business.authorityType !== "Business Authorities" && (
              <div className="mt-2 text-[10px] md:text-[11px] font-normal px-2 py-1 bg-kite-blue/10 text-blue-800 rounded-sm w-max border border-kite-blue/30 uppercase tracking-wider">
                {" "}
                {business.authorityType}{" "}
                {business.rmasSubsidy
                  ? ` - RMAS Assisted: ${business.rmasSubsidy}% Interest`
                  : ""}{" "}
              </div>
            )}{" "}
        </div>{" "}
      </div>{" "}
      <div className="mt-4 md:mt-4 sm:mt-4 md:mt-8 border border-kite-border rounded-sm overflow-x-auto w-full max-w-full">
        {" "}
        <table className="w-full text-left text-[11px] md:text-[12px]">
          {" "}
          <thead className="bg-kite-bg font-normal uppercase text-[11px] md:text-[12px] tracking-wider">
            {" "}
            <tr>
              {" "}
              <th className="p-2 sm:p-4 border-b border-kite-border">
                Description
              </th>{" "}
              <th className="p-2 sm:p-4 border-b border-kite-border text-right">
                Amount
              </th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="divide-y divide-kite-border-hard text-[11px] md:text-[12px]">
            {" "}
            <tr>
              {" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 font-normal">
                Original Invested Capital
              </td>{" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-normal">
                {formatINR(investment.amount)}
              </td>{" "}
            </tr>{" "}
            <tr
              className={`border-b border-kite-border ${(payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) + (payout?.rmasPrematurePenalty || 0) - investment.amount < 0 ? "bg-kite-red/10" : "bg-kite-green/10"}`}
            >
              {" "}
              <td
                className={`p-2 sm:p-4 py-1.5 md:py-2 font-normal ${(payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) + (payout?.rmasPrematurePenalty || 0) - investment.amount < 0 ? "text-red-800" : "text-green-800"}`}
              >
                {" "}
                {(payout?.totalCredited || 0) +
                  (payout?.rmasCommission || 0) +
                  (payout?.happyIncomeTax || 0) +
                  (payout?.rmasPrematurePenalty || 0) -
                  investment.amount <
                0
                  ? "Total Market Loss"
                  : "Total Profit & Interest"}{" "}
              </td>{" "}
              <td
                className={`p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-normal ${(payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) + (payout?.rmasPrematurePenalty || 0) - investment.amount < 0 ? "text-red-800" : "text-green-800"}`}
              >
                {" "}
                {(payout?.totalCredited || 0) +
                  (payout?.rmasCommission || 0) +
                  (payout?.happyIncomeTax || 0) +
                  (payout?.rmasPrematurePenalty || 0) -
                  investment.amount <
                0
                  ? "-"
                  : "+"}
                {formatINR(
                  Math.abs(
                    (payout?.totalCredited || 0) +
                      (payout?.rmasCommission || 0) +
                      (payout?.happyIncomeTax || 0) +
                      (payout?.rmasPrematurePenalty || 0) -
                      investment.amount,
                  ),
                )}{" "}
              </td>{" "}
            </tr>{" "}
            <tr className="bg-kite-bg border-b-2 border-black">
              {" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-text font-normal uppercase tracking-wider text-[11px] md:text-[12px]">
                Gross Payble Amount
              </td>{" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-kite-text font-normal">
                {formatINR(
                  (payout?.totalCredited || 0) +
                    (payout?.rmasCommission || 0) +
                    (payout?.happyIncomeTax || 0) +
                    (payout?.rmasPrematurePenalty || 0),
                )}
              </td>{" "}
            </tr>{" "}
            {business.authorityType &&
            business.rmasSubsidy &&
            business.rmasSubsidy > 0 ? (
              <tr className="bg-kite-blue/10 border-b-2 border-black">
                {" "}
                <td className="p-2 sm:p-4 py-1.5 md:py-2 text-blue-900 font-normal text-[11px] md:text-[12px] uppercase tracking-wider italic">
                  Of above Gross, RMAS Fund Contribution ({business.rmasSubsidy}
                  %)
                </td>{" "}
                <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-blue-900 font-normal">
                  {formatINR(
                    investment.amount * ((business.rmasSubsidy || 0) / 100),
                  )}
                </td>{" "}
              </tr>
            ) : null}{" "}
            {(payout?.rmasPrematurePenalty || 0) > 0 ? (
              <tr>
                {" "}
                <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-red font-normal">
                  Less: RMAS Premature Penalty
                </td>{" "}
                <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-kite-red font-normal">
                  -{formatINR(payout?.rmasPrematurePenalty || 0)}
                </td>{" "}
              </tr>
            ) : null}{" "}
            <tr>
              {" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-text font-normal">
                Less: RMAS Service Commission
              </td>{" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-normal text-kite-text">
                -{formatINR(payout?.rmasCommission || 0)}
              </td>{" "}
            </tr>{" "}
            <tr className="border-b-[3px] border-black">
              {" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-red font-normal">
                Less: Happy Muslim Income Tax
              </td>{" "}
              <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-kite-red font-normal">
                -{formatINR(payout?.happyIncomeTax || 0)}
              </td>{" "}
            </tr>{" "}
          </tbody>{" "}
          <tfoot className="bg-black text-white">
            {" "}
            <tr>
              {" "}
              <td className="p-1.5 md:p-3 md:p-5 font-normal uppercase tracking-wider text-[11px] md:text-[12px]">
                Amount Credited to Investor
              </td>{" "}
              <td className="p-2 sm:p-3 md:p-5 text-right font-mono font-normal text-[11px] md:text-[12px]">
                {formatINR(payout?.totalCredited || 0)}
              </td>{" "}
            </tr>{" "}
          </tfoot>{" "}
        </table>{" "}
      </div>{" "}
      <div className="space-y-2 sm:space-y-4 text-justify text-[11px] md:text-[12px] mt-4 sm:mt-4 sm:mt-4 md:mt-8 pb-2 sm:pb-4">
        {" "}
        <p className="font-normal">: Settlement Agreement :</p>{" "}
        <p>
          This profit slip serves as the official confirmation of the settlement
          generated by RADHIKA MA SERVICE. All mentioned deductions (Happy
          Muslim Income Tax & RMAS Commission) have been accounted for mutually.
          The calculated Final Net Credited amount has been processed to the
          registered bank details provided by the investor.
        </p>{" "}
        <p>
          The business owner ({business.ownerName}) and Investor (
          {investor.name?.toUpperCase()}) acknowledge this complete withdrawal
          transaction. For further investments or queries, kindly contact the
          Radhika Ma Service Team.
        </p>{" "}
      </div>{" "}
      <div className="flex justify-between items-end pt-6 sm:pt-12 border-t border-kite-border mt-3 md:mt-6 sm:mt-4 sm:mt-12">
        {" "}
        <div className="text-center">
          {" "}
          <p className="font-normal border-t border-black pt-2 w-48 mx-auto mt-16">
            Authorized Digital Sign
          </p>{" "}
          <p className="text-[11px] md:text-[12px] uppercase text-gray-600 font-normal mt-1">
            RMAS Accounts Team
          </p>{" "}
        </div>{" "}
        <div className="text-right">
          {" "}
          <p className="text-[11px] md:text-[12px] text-gray-600">
            Transaction Date: {new Date().toLocaleDateString("en-IN")}
          </p>{" "}
          <p className="text-[11px] md:text-[12px] text-gray-600 font-mono mt-1">
            Ref No: RT-{Math.random().toString().slice(2, 10)}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
