import React, { useState, useRef, useEffect } from"react";
import { useAppContext } from"../utils/AppContext";
import AddInvestmentModal from "../components/AddInvestmentModal";
import { formatINR } from"../utils/mockData";
import {
  Plus,
  ReceiptIndianRupee,
  Search,
  X,
  CheckCircle,
  Wallet,
  BadgeCheck,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
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
export default function Investments() {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  const blueTickBusinessIds = getBlueTickBusinessIds(
    state.businesses,
    state.investments,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [addModalBusinessId, setAddModalBusinessId] = useState("");
  const [addModalInvestorId, setAddModalInvestorId] = useState("");
  const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");
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
  // Scroll preservation
  const dragRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainRef.current = document.querySelector("main");
  }, []);
  useEffect(() => {
    const isList = !showAddForm && !selectedInvestment;
    if (isList) {
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
  }, [showAddForm, selectedInvestment]);
  const [withdrawFormData, setWithdrawFormData] = useState({
    completedMonths:"12",
    rmasCommission:"",
    happyIncomeTax:"",
  });
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
  const [formData, setFormData] = useState({
    businessId:"",
    investorId:"",
    amount:"",
    timePeriodMonths:"12",
    adminCommissionInvestorPct:"2",
    adminCommissionBusinessPct:"2",
  });
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
        businessName: selectedBusiness.name,
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
  const uniqueInvestments = Array.from(
    new Map<string, Investment>(
      state.investments.map((inv) => [inv.id, inv]),
    ).values(),
  );
  const allGroupedInvestments = Object.values(
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
  );
  const holdingGroupedCount = allGroupedInvestments.filter(
    (inv: any) => inv.status ==="active",
  ).length;
  // Dynamic position count: Count only grouped investments currently in profit
  const positionsGroupedCount = allGroupedInvestments.filter((inv: any) => {
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
  }).length;
  const groupedInvestments = allGroupedInvestments
    .filter((inv) => {
      const business = state.businesses.find((b) => b.id === inv.businessId);
      const investor = state.investors.find((i) => i.id === inv.investorId);
      const match = searchTerm.toLowerCase();
      const searchMatch =
        business?.name.toLowerCase().includes(match) ||
        investor?.name.toLowerCase().includes(match);
      const tabMatch =
        activeTab ==="holding"
          ? inv.status ==="active"
          : inv.status ==="completed";
      return searchMatch && tabMatch;
    })
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const activeBusinesses = state.businesses
    .slice()
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const sortedInvestors = state.investors
    .slice()
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  return (
    <div className="w-full flex flex-col font-sans bg-kite-surface dark:bg-transparent">
      {""}
      <div
        className={`flex flex-col w-full bg-kite-surface dark:bg-transparent pt-2 border-b border-kite-border ${showAddForm ?"hidden md:flex" :"flex"}`}
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
      <div
        className={`flex items-center justify-between w-full py-3 px-4 w-full ${showAddForm ?"hidden md:flex" :"flex"}`}
      >
        {""}
        {!isSearchExpanded && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
              className="p-1 hover:bg-gray-100 dark:hover:bg-kite-border-soft rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
            >
              <Search className="w-[18px] h-[18px] text-kite-blue" />
            </button>
          ) : (
            <div className="flex items-center w-full md:w-[250px] transition-all duration-300 bg-kite-surface md:bg-transparent rounded-sm h-[36px]">
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchTerm("");
                }}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-kite-border-soft rounded-full mr-1 transition-colors flex-shrink-0 flex items-center justify-center"
              >
                <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Eg: RMAS,SARITA.."
                className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 font-sans h-[36px]"
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
      <AnimatePresence>
        {""}
        {showAddForm && (
          <motion.div
            key="mobile-add-form"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
            className="md:hidden fixed inset-0 z-[110] bg-white dark:bg-[#1E2938] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center px-4 pb-3 bg-white dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] shrink-0 z-10 mobile-header-safe">
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="ml-2 flex-1 mt-0.5">
                <h2 className="text-[17px] font-normal text-gray-900 dark:text-[#F1F5F9] leading-tight">
                  {selectedBusiness ? selectedBusiness.name.toUpperCase() : "New Investment"}
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-[#A3ACB8] mt-0.5 font-normal">
                  FND {selectedBusiness ? formatINR(selectedBusiness.fundingRequired || 0) : "₹0"} • INC {selectedBusiness ? formatINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)) : "₹0"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-[200px] bg-white dark:bg-[#1E2938]">
                {/* Main Inputs */}
                <div className="bg-white dark:bg-transparent overflow-hidden relative">
                  {/* Business & Investor Select */}
                  <div className="flex flex-col">
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10" onClick={() => setShowBusinessSelect(true)}>
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Business</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[15px] font-medium text-gray-900 dark:text-[#F1F5F9] truncate pr-2">
                            {selectedBusiness ? selectedBusiness.name.toUpperCase() : "Select Business"}
                          </p>
                          <ChevronDown className="w-4 h-4 text-[#4184F3]" />
                        </div>
                     </div>
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10" onClick={() => setShowInvestorSelect(true)}>
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Investor</p>
                        <div className="flex justify-between items-center">
                          <p className="text-[15px] font-medium text-gray-900 dark:text-[#F1F5F9] truncate pr-2">
                            {selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}
                          </p>
                          <ChevronDown className="w-4 h-4 text-[#4184F3]" />
                        </div>
                     </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex flex-col">
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-2 uppercase tracking-wider">Investment Amount</p>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full bg-transparent px-0 py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="₹0"
                            value={formData.amount ? `₹${formData.amount}` : ""}
                            onChange={handleAmountChange}
                          />
                        </div>
                     </div>
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10">
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-2 uppercase tracking-wider">Duration (M)</p>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-transparent px-0 py-1 text-[18px] font-medium text-gray-900 dark:text-[#F1F5F9] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="12"
                            value={formData.timePeriodMonths}
                            onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                          />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Secondary Toggles Card */}
                <div className="bg-white dark:bg-transparent overflow-hidden relative p-4 space-y-4 border-b border-gray-200 dark:border-[#44546A]">
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
              className="md:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 mobile-safe-pb"
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
                     className="absolute inset-0 bg-white dark:bg-[#1E2938] z-50 flex flex-col"
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
                     <div className="overflow-y-auto flex-1 hide-scrollbar">
                       {activeBusinesses
                         .filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(businessSearch.toLowerCase()))
                         .map((b, idx) => (
                            <div
                              key={`mob_sel_biz_${b.id}_${idx}`}
                             className="px-4 py-3.5 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-[#44546A]"
                             onClick={() => {
                               const reqFundFormatted = b.fundingRequired ? b.fundingRequired.toLocaleString("en-IN") : "";
                               setFormData({ ...formData, businessId: b.id, amount: reqFundFormatted });
                               setShowBusinessSelect(false);
                             }}
                           >
                             <div>
                               <span className="font-medium text-[14px] text-gray-900 dark:text-[#F1F5F9] uppercase">{b.name}</span>
                               <span className="text-[12px] text-gray-500 dark:text-[#A3ACB8] block mt-0.5">ID: {b.businessId}</span>
                             </div>
                           </div>
                         ))}
                     </div>
                   </motion.div>
                 </>
               )}
            </AnimatePresence>

            {/* Investor Select Overlay */}
            <AnimatePresence>
               {showInvestorSelect && (
                 <>
                   <motion.div
                     initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                     transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                     className="absolute inset-0 bg-white dark:bg-[#1E2938] z-50 flex flex-col"
                   >
                     <div className="flex items-center px-4 py-3 bg-white dark:bg-[#2B3648] border-b border-gray-200 dark:border-[#44546A] shrink-0 z-10 mobile-header-safe">
                       <button onClick={() => setShowInvestorSelect(false)} className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center">
                         <ArrowLeft className="w-5 h-5" />
                       </button>
                       <h3 className="ml-3 text-[16px] font-medium text-gray-900 dark:text-[#F1F5F9] tracking-wide">Select Investor</h3>
                     </div>
                     <div className="p-4 shrink-0 border-b border-gray-200 dark:border-[#44546A]">
                       <div className="relative">
                         <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-[#A3ACB8]" />
                         <input
                           type="text" autoFocus placeholder="Search investors or Investor ID..."
                           className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#39475B] border border-gray-200 dark:border-[#44546A] rounded-[4px] text-[15px] text-gray-900 dark:text-[#F1F5F9] outline-none focus:border-[#4184F3] focus:ring-1 focus:ring-[#4184F3]/20 transition-all"
                           value={investorSearch} onChange={(e) => setInvestorSearch(e.target.value)}
                         />
                       </div>
                     </div>
                     <div className="overflow-y-auto flex-1 hide-scrollbar">
                       {sortedInvestors
                         .filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(investorSearch.toLowerCase()))
                         .map((i, idx) => {
                            const activeCount = selectedBusiness ? state.investments.filter(inv => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;
                            return (
                            <div
                              key={`mob_sel_inv_${i.id}_${idx}`}
                             className="px-4 py-3.5 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-[#44546A]"
                             onClick={() => {
                               setFormData({ ...formData, investorId: i.id });
                               setShowInvestorSelect(false);
                             }}
                           >
                             <div>
                               <span className="font-medium text-[14px] text-gray-900 dark:text-[#F1F5F9] uppercase">{i.name}</span>
                               <span className="text-[12px] text-gray-500 dark:text-[#A3ACB8] block mt-0.5">ID: {i.investorId} {i.email ? `• ${i.email}` : ''}</span>
                             </div>
                             {activeCount > 0 && (
                               <div className="bg-[#4184F3] text-white text-[12px] font-medium px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] h-[20px]">
                                 {activeCount}
                               </div>
                             )}
                           </div>
                           );
                         })}
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
        <div className="flex flex-col pb-16">
          {/* DESKTOP HEADER */}
          <div className="hidden md:flex flex-row items-center justify-between w-full px-4 py-2 text-[11px] text-kite-text-light tracking-wide font-normal bg-kite-surface border-b border-kite-border-soft">
             <div className="w-3/12 text-left">Instrument</div>
             <div className="w-1/12 text-right">Qty.</div>
             <div className="w-2/12 text-right">Avg. cost</div>
             <div className="w-2/12 text-right">LTP</div>
             <div className="w-2/12 text-right">Cur. val</div>
             <div className="w-2/12 text-right">P&L</div>
             <div className="w-1/12 text-right">Net chg.</div>
          </div>
          {""}
          {groupedInvestments.map((inv: any, idx: number) => {
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
            const qty = inv.groupedInvestmentsList.length;
            const avgPrice = inv.amount / qty;
            const currentLTP = curValue / qty;
            const isOverallTrendPositive = overallTrend >= 0;
            return (
              <div
                key={`grouped_${inv.key}_${idx}`}
                className="w-full flex flex-col md:flex-row md:items-center px-4 py-3 md:py-3 hover:bg-gray-50 dark:hover:bg-[#202020] border-b border-kite-border-soft transition-colors cursor-pointer group font-sans outline-none focus:outline-none focus:ring-0 focus:bg-transparent dark:focus:bg-[#202020] active:outline-none"
                onClick={() => {
                  setSelectedInvestment(inv);
                  setSelectedInvestmentIds(
                    inv.groupedInvestmentsList.map((i: any) => i.id),
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
                    <div className={`text-[11px] md:text-[12px] font-normal ${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                      {isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                  {/* Line 2: Core Business Name & Absolute P&L Row */}
                  <div className="flex justify-between items-center mb-1.5 leading-tight">
                     <div className="flex items-center gap-1.5">
                        <h3 className="text-kite-text font-normal text-[12px] md:text-[13px] uppercase tracking-wide">
                           {business?.name?.toUpperCase() || "UNKNOWN BUSINESS"}
                        </h3>
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck
                            className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0"
                            title="RMAS Verified"
                          />
                        )}
                     </div>
                     <div className={`text-[13px] md:text-[14px] font-normal ${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
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
                <div className="hidden md:flex flex-row items-center justify-between w-full text-[13px]">
                   <div className="w-3/12 flex flex-col">
                      <div className="flex items-center gap-1.5 text-kite-text font-normal uppercase tracking-wide">
                        {business?.name?.toUpperCase() || "UNKNOWN BUSINESS"}
                        {business && blueTickBusinessIds.has(business.id) && (
                          <BadgeCheck className="w-3.5 h-3.5 text-white fill-kite-blue shrink-0" title="RMAS Verified" />
                        )}
                      </div>
                      <span className="text-[11px] text-kite-text-light uppercase tracking-wide mt-0.5">{investor?.name?.toUpperCase()}</span>
                   </div>
                   <div className="w-1/12 text-right text-kite-text-light">{qty}</div>
                   <div className="w-2/12 text-right text-kite-text-light">{formatINR(avgPrice).replace("₹", "")}</div>
                   <div className="w-2/12 text-right text-kite-text-light">{formatINR(currentLTP).replace("₹", "")}</div>
                   <div className="w-2/12 text-right text-kite-text-light">{formatINR(curValue).replace("₹", "")}</div>
                   <div className={`w-2/12 text-right font-normal ${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                      {isProfit && holdingProfit >= 0 ? "+" : ""}
                      {formatINR(holdingProfit).replace("₹", "")}
                   </div>
                   <div className={`w-1/12 text-right font-normal ${isProfit ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                      {isProfit ? "+" : ""} {pnlPercentage.toFixed(2)}%
                   </div>
                </div>
              </div>
            );
          })}{""}
          {groupedInvestments.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              {""}
              <p className="text-kite-text-muted text-[13px] md:text-[14px] font-light">
                {""}
                No investments found.{""}
              </p>{""}
            </div>
          )}{""}
        </div>{""}
        {/* Sticky Bottom Summary Bar */}{""}
        {groupedInvestments.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 md:relative bg-kite-surface border-t border-kite-border px-4 py-3 flex justify-between items-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.02)] z-30">
            {""}
            <span className="text-[11px] md:text-[12px] font-medium text-kite-text-light tracking-wide">
              {""}
              Day's P&L{""}
            </span>{""}
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
                    className={`text-[13px] md:text-[14px] font-normal ${isTotalProfit ?"text-[#16A34A]" :"text-[#DC2626]"}`}
                    style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {""}
                    {isTotalProfit && totalLiveProfit > 0 ?"+" :""}{""}
                    {formatINR(totalLiveProfit)}{""}
                  </span>{""}
                  <span
                    className={`text-[11px] md:text-[12px] font-normal ${isTotalProfit ?"text-[#16A34A]" :"text-[#DC2626]"}`}
                  >
                    {""}
                    {isTotalProfit ?"+" :""} {totalPnlPercentage.toFixed(2)}
                    %{""}
                  </span>{""}
                </div>
              );
            })()}{""}
          </div>
        )}{""}
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
               businessName: business?.name || "",
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
                className="absolute inset-0 max-md:bg-kite-bg max-md:dark:bg-kite-bg md:bg-black/40 dark:md:bg-black/70" onClick={() => setSelectedInvestment(null)}></motion.div>
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
                      className="p-2 -ml-2 text-kite-text hover:bg-gray-50 dark:hover:bg-[#202020] rounded-full transition-colors outline-none focus:outline-none focus:ring-0 active:outline-none flex items-center justify-center"
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
                          className="md:hidden p-2 -mr-2 text-kite-text hover:bg-gray-50 dark:hover:bg-kite-border-soft rounded-full transition-colors outline-none"
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
                             className="px-4 py-1.5 bg-[#D94B4B] hover:bg-[#C93B3B] text-white text-[13px] font-medium rounded transition-colors"
                           >
                             EXIT
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
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-kite-blue hover:bg-kite-bg dark:hover:bg-kite-border-soft transition-colors outline-none"
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
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-[#D94B4B] hover:bg-kite-bg dark:hover:bg-kite-border-soft transition-colors border-t border-kite-border outline-none"
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
                          {business?.name?.toUpperCase()}{""}
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
                              ?"bg-[#E6F6ED] dark:bg-[#00A86B]/20 text-[#00A86B] dark:text-[#00A86B]"
                              :"bg-[#FCEBEB] dark:bg-[#D94B4B]/20 text-[#D94B4B] dark:text-[#D94B4B]")
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
                                :"text-[#00A86B]"
                              :"text-[#D94B4B]")
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
                                          className={`text-[11px] md:text-[12px] font-normal ${unitIsProfit ? (selectedInvestment.status ==="completed" ?"text-kite-blue" :"text-[#00A86B]") :"text-[#D94B4B]"}`}
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
                          <h4 className="text-kite-red font-medium text-[11px] md:text-[12px] tracking-wider mb-4">
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
                                className="w-full border-b border-kite-border py-1.5 text-[13px] md:text-[14px] outline-none font-medium bg-transparent focus:border-kite-red text-kite-red"
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
                                    ?"text-kite-green font-medium"
                                    :"text-kite-red font-medium"
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
                                    ?"text-kite-red font-medium"
                                    :"text-kite-green font-medium"
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
                          <h4 className="font-medium text-kite-green flex items-center space-x-2 mb-4">
                            {""}
                            <CheckCircle className="w-4 h-4" />{""}
                            <span>Completed Settlement Breakdown</span>{""}
                          </h4>{""}
                          <div className="space-y-2 text-[13px] md:text-[14px] text-green-900">
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
                              <span className="text-kite-red">
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
                              <span className="text-kite-red">
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
                              <span className="font-mono">
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
                          <span className="text-[13px] md:text-[14px] font-medium text-kite-red">
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
                        <span className="text-[13px] md:text-[14px] font-medium text-kite-red">
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
                        className="w-full py-3 bg-[#D94B4B] hover:bg-[#C93B3B] text-white font-medium rounded transition-colors uppercase tracking-wider text-[13px] md:text-[14px]"
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
