import React, { useState, useRef, useEffect } from"react";
import { useAppContext } from"../utils/AppContext";
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
} from"lucide-react";
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
  const [showInvestorSelect, setShowInvestorSelect] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState<{
    businessName: string;
    investorName: string;
    amount: number;
  } | null>(null);
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [payoutFreq, setPayoutFreq] = useState("Monthly");
  const [expectedRoi, setExpectedRoi] = useState("10.5");
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
    const selectedInvestor = state.investors.find(
      (i) => i.id === formData.investorId,
    );
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
              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
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
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full mr-1 transition-colors flex-shrink-0"
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
          <div className="fixed top-0 left-0 right-0 bottom-[calc(60px+env(safe-area-inset-bottom))] md:bottom-0 z-[90] md:z-[200] flex justify-end font-sans">
            {""}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAddForm(false)}
            />{""}
            <motion.div
              initial={{ x:"100%" }}
              animate={{ x: 0 }}
              exit={{ x:"100%" }}
              transition={{ type:"spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 right-0 w-full md:max-w-[500px] bg-kite-surface shadow-2xl flex flex-col"
            >
              {""}
              {/* Header */}{""}
              <div className="flex items-center px-4 h-[60px] bg-kite-surface border-b border-kite-border shrink-0 sticky top-0 z-20">
                {""}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setIsBuyFlow(false);
                  }}
                  className="text-kite-text p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {""}
                  <ArrowLeft className="w-5 h-5" />{""}
                </button>{""}
                <div className="ml-4 flex flex-col">
                  {""}
                  <h3 className="text-[17px] md:text-[18px] font-medium text-kite-text leading-tight">
                    {""}
                    {isBuyFlow ?"BUY" :"Book Investment"}{""}
                  </h3>{""}
                  <p className="text-[11px] md:text-[12px] text-kite-text-muted font-normal mt-0.5">
                    {""}
                    {isBuyFlow
                      ?"Add more investment"
                      :"Create a new investment"}{""}
                  </p>{""}
                </div>{""}
              </div>{""}
              <div className="flex-1 overflow-y-auto hide-scrollbar pb-[140px]">
                {""}
                <div className="px-4 py-4 space-y-[16px]">
                  {""}
                  {/* SECTION 1: Business */}{""}
                  <div className="space-y-[4px]">
                    {""}
                    <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                      {""}
                      BUSINESS{""}
                    </label>{""}
                    <div
                      className={`w-full border-b border-kite-border py-2 flex justify-between items-center transition-colors ${!isBuyFlow ?"cursor-pointer active:opacity-70" :""}`}
                      onClick={() => {
                        if (isBuyFlow) return;
                        setShowBusinessSelect(true);
                        setShowInvestorSelect(false);
                        setBusinessSearch("");
                      }}
                    >
                      {""}
                      <div className="flex flex-col">
                        {""}
                        {selectedBusiness ? (
                          <>
                            {""}
                            <span className="text-[15px] md:text-[16px] font-medium text-kite-text uppercase">
                              {""}
                              {selectedBusiness.name?.toUpperCase()}{""}
                            </span>{""}
                            <span className="text-[11px] md:text-[12px] text-kite-text-muted mt-0.5">
                              {""}
                              Owner: {selectedBusiness.ownerName ||"N/A"}{""}
                            </span>{""}
                          </>
                        ) : (
                          <span className="text-[15px] md:text-[16px] text-kite-text-muted">
                            {""}
                            Select Business{""}
                          </span>
                        )}{""}
                      </div>{""}
                      {!isBuyFlow && (
                        <ChevronDown className="w-4 h-4 text-kite-text-muted" />
                      )}{""}
                    </div>{""}
                  </div>{""}
                  {/* SECTION 2: Investor */}{""}
                  <div className="space-y-[4px]">
                    {""}
                    <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                      {""}
                      INVESTOR{""}
                    </label>{""}
                    <div
                      className={`w-full border-b border-kite-border py-2 flex justify-between items-center transition-colors ${!isBuyFlow ?"cursor-pointer active:opacity-70" :""}`}
                      onClick={() => {
                        if (isBuyFlow) return;
                        setShowInvestorSelect(true);
                        setShowBusinessSelect(false);
                        setInvestorSearch("");
                      }}
                    >
                      {""}
                      <div className="flex flex-col">
                        {""}
                        {formData.investorId ? (
                          <>
                            {""}
                            <span className="text-[15px] md:text-[16px] font-medium text-kite-text uppercase">
                              {""}
                              {
                                state.investors.find(
                                  (i) => i.id === formData.investorId,
                                )?.name
                              }{""}
                            </span>{""}
                            <span className="text-[11px] md:text-[12px] text-kite-text-muted mt-0.5">
                              {""}
                              ID: #{""}
                              {
                                state.investors.find(
                                  (i) => i.id === formData.investorId,
                                )?.investorId
                              }{""}
                            </span>{""}
                          </>
                        ) : (
                          <span className="text-[15px] md:text-[16px] text-kite-text-muted">
                            {""}
                            Select Investor{""}
                          </span>
                        )}{""}
                      </div>{""}
                      {!isBuyFlow && (
                        <ChevronDown className="w-4 h-4 text-kite-text-muted" />
                      )}{""}
                    </div>{""}
                  </div>{""}
                  {/* SECTION 3: Amount */}{""}
                  <div className="space-y-[4px]">
                    {""}
                    <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                      {""}
                      INVESTMENT AMOUNT{""}
                    </label>{""}
                    <div className="w-full border-b border-kite-border py-2 flex justify-between items-center focus-within:border-kite-blue transition-colors">
                      {""}
                      <div className="flex items-center w-full">
                        {""}
                        <span className="text-[17px] md:text-[18px] text-kite-text mr-2">
                          ₹
                        </span>{""}
                        <input
                          required
                          type="text"
                          className="w-full text-[17px] md:text-[18px] font-medium text-kite-text outline-none bg-transparent placeholder-[#ccc]"
                          value={formData.amount}
                          onChange={handleAmountChange}
                          placeholder="5,00,000"
                        />{""}
                      </div>{""}
                    </div>{""}
                  </div>{""}
                  {/* SECTION 4 & 5 */}{""}
                  <div className="grid grid-cols-2 gap-6">
                    {""}
                    <div className="space-y-[4px]">
                      {""}
                      <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        DURATION (MONTHS){""}
                      </label>{""}
                      <div className="w-full border-b border-kite-border py-2 flex justify-between items-center focus-within:border-kite-blue transition-colors">
                        {""}
                        <input
                          type="number"
                          min="1"
                          className="w-full text-[15px] md:text-[16px] md:text-[16px] text-kite-text outline-none bg-transparent font-medium"
                          value={formData.timePeriodMonths}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timePeriodMonths: e.target.value,
                            })
                          }
                        />{""}
                      </div>{""}
                    </div>{""}
                    <div className="space-y-[4px]">
                      {""}
                      <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        EXPECTED ROI (%){""}
                      </label>{""}
                      <div className="w-full border-b border-kite-border py-2 flex justify-between items-center focus-within:border-kite-blue transition-colors">
                        {""}
                        <input
                          type="number"
                          step="0.1"
                          className="w-full text-[15px] md:text-[16px] md:text-[16px] text-kite-text outline-none bg-transparent font-medium"
                          value={expectedRoi}
                          onChange={(e) => setExpectedRoi(e.target.value)}
                        />{""}
                      </div>{""}
                    </div>{""}
                  </div>{""}
                  {/* SECTION 7: Payout Frequency */}{""}
                  <div className="space-y-[8px] pt-2">
                    {""}
                    <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                      {""}
                      PAYOUT FREQUENCY{""}
                    </label>{""}
                    <div className="flex border border-kite-border rounded-[4px] p-0.5 max-w-[200px]">
                      {""}
                      {["Monthly","Yearly"].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setPayoutFreq(freq)}
                          className={`flex-1 py-1.5 text-[11px] md:text-[12px] font-medium rounded-[2px] transition-all duration-200 ${payoutFreq === freq ?"bg-kite-blue text-white shadow-sm" :"text-kite-text hover:bg-gray-50"}`}
                        >
                          {""}
                          {freq}{""}
                        </button>
                      ))}{""}
                    </div>{""}
                  </div>{""}
                  {/* Percentage Inputs */}{""}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {""}
                    <div className="space-y-[4px]">
                      {""}
                      <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        INVESTOR NTSC (%){""}
                      </label>{""}
                      <div className="w-full border-b border-kite-border py-2 flex justify-between items-center focus-within:border-kite-blue transition-colors">
                        {""}
                        <input
                          type="number"
                          step="0.1"
                          className="w-full text-[15px] md:text-[16px] md:text-[16px] text-kite-text outline-none bg-transparent font-medium"
                          value={formData.adminCommissionInvestorPct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminCommissionInvestorPct: e.target.value,
                            })
                          }
                        />{""}
                      </div>{""}
                    </div>{""}
                    <div className="space-y-[4px]">
                      {""}
                      <label className="block text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        BUSINESS NTSC (%){""}
                      </label>{""}
                      <div className="w-full border-b border-kite-border py-2 flex justify-between items-center focus-within:border-kite-blue transition-colors">
                        {""}
                        <input
                          type="number"
                          step="0.1"
                          className="w-full text-[15px] md:text-[16px] md:text-[16px] text-kite-text outline-none bg-transparent font-medium"
                          value={formData.adminCommissionBusinessPct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminCommissionBusinessPct: e.target.value,
                            })
                          }
                        />{""}
                      </div>{""}
                    </div>{""}
                  </div>{""}
                  <div className="border border-kite-border rounded-[4px] p-3 space-y-3 mt-4 bg-kite-bg">
                    {""}
                    <div className="flex justify-between items-center">
                      {""}
                      <span className="text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        Investment Amount{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] text-kite-text font-medium">
                        {""}
                        {formatINR(getRawAmount(formData.amount))}{""}
                      </span>{""}
                    </div>{""}
                    <div className="flex justify-between items-center">
                      {""}
                      <span className="text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        Investor NTSC{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] text-[#d9534f] font-medium">
                        {""}
                        -{formatINR(calculateCommissions().investorNTSC)}{""}
                      </span>{""}
                    </div>{""}
                    <div className="flex justify-between items-center pt-2 border-t border-kite-border">
                      {""}
                      <span className="text-[11px] md:text-[12px] font-medium text-kite-text">
                        {""}
                        Net Investment{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                        {""}
                        {formatINR(calculateCommissions().netInvestment)}{""}
                      </span>{""}
                    </div>{""}
                    <div className="flex justify-between items-center pt-2 border-t border-kite-border">
                      {""}
                      <span className="text-[11px] md:text-[12px] text-kite-text-muted">
                        {""}
                        Business NTSC{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] text-kite-text font-medium">
                        {""}
                        {formatINR(calculateCommissions().businessNTSC)}{""}
                      </span>{""}
                    </div>{""}
                    <div className="flex justify-between items-center pt-2 border-t border-kite-border">
                      {""}
                      <span className="text-[11px] md:text-[12px] font-medium text-kite-text">
                        {""}
                        RMAS Brokrage{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] font-medium text-[#00a86b]">
                        {""}
                        +{formatINR(calculateCommissions().totalAdmin)}{""}
                      </span>{""}
                    </div>{""}
                  </div>{""}
                </div>{""}
              </div>{""}
              {/* BOTTOM ACTION */}{""}
              <div className="absolute bottom-0 left-0 shrink-0 w-full bg-white dark:bg-kite-surface px-4 py-3 md:pb-4 z-30">
                {""}
                <div className="md:hidden">
                  {""}
                  <div className="flex justify-between items-center mb-3 px-1">
                    {""}
                    <div className="flex items-baseline space-x-2">
                      {""}
                      <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                        {""}
                        Invest{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] font-medium text-kite-blue">
                        {""}
                        {formatINR(calculateCommissions().netInvestment)}{""}
                      </span>{""}
                    </div>{""}
                    <div className="flex items-baseline space-x-2">
                      {""}
                      <span className="text-[11px] md:text-[12px] font-normal text-kite-text-muted uppercase tracking-wide">
                        {""}
                        RMAS Brokrage{""}
                      </span>{""}
                      <span className="text-[13px] md:text-[14px] font-medium text-kite-text">
                        {""}
                        {formatINR(calculateCommissions().totalAdmin)}{""}
                      </span>{""}
                    </div>{""}
                  </div>{""}
                  <div className="md:hidden w-full mb-8 px-[16px]">
                    {""}
                    <SwipeButton
                      text="SWIPE TO BUY"
                      successText="PROCESSING..."
                      actionType="BUY"
                      onSuccess={() => {
                        handleAddSubmit({ preventDefault: () => {} } as any);
                      }}
                    />{""}
                  </div>{""}
                </div>{""}
                <button
                  onClick={handleAddSubmit}
                  disabled={isBooking}
                  className="hidden md:flex w-full h-[44px] bg-kite-blue hover:bg-kite-blue-dark disabled:opacity-70 text-white rounded-[4px] text-[13px] md:text-[14px] tracking-widest font-medium items-center justify-center transition-colors relative uppercase"
                >
                  {""}
                  <span
                    className={"relative z-10 flex items-center justify-center" +
                      (isBooking ?"opacity-0" :"opacity-100")
                    }
                  >
                    {""}
                    Book Investment{""}
                  </span>{""}
                  {isBooking && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      {""}
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>{""}
                    </div>
                  )}{""}
                </button>{""}
              </div>{""}
              {/* Bottom Sheet: Business Select */}{""}
              <AnimatePresence>
                {""}
                {showBusinessSelect && (
                  <>
                    {""}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 z-40"
                      onClick={() => setShowBusinessSelect(false)}
                    />{""}
                    <motion.div
                      initial={{ y:"100%" }}
                      animate={{ y: 0 }}
                      exit={{ y:"100%" }}
                      transition={{
                        type:"spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="absolute bottom-0 left-0 w-full bg-kite-surface rounded-t-[16px] z-50 flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                      {""}
                      <div className="flex justify-center pt-3 pb-2 shrink-0">
                        {""}
                        <div className="w-10 h-1 bg-kite-border rounded-full"></div>{""}
                      </div>{""}
                      <div className="px-4 pb-3 shrink-0 flex items-center justify-between border-b border-kite-border">
                        {""}
                        <h3 className="text-[15px] md:text-[16px] md:text-[16px] font-medium text-kite-text">
                          {""}
                          Select Business{""}
                        </h3>{""}
                        <button
                          type="button"
                          onClick={() => setShowBusinessSelect(false)}
                          className="p-2 -mr-2 bg-kite-bg rounded-full text-kite-text-light"
                        >
                          {""}
                          <X className="w-4 h-4" />{""}
                        </button>{""}
                      </div>{""}
                      <div className="p-4 shrink-0">
                        {""}
                        <div className="relative border-b border-kite-border pb-1">
                          {""}
                          <Search className="w-4 h-4 absolute left-1 top-1 text-kite-text-muted" />{""}
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search business..."
                            className="w-full pl-7 pr-4 py-1 bg-transparent text-[13px] md:text-[14px] text-kite-text outline-none placeholder-[#ccc]"
                            value={businessSearch}
                            onChange={(e) => setBusinessSearch(e.target.value)}
                          />{""}
                        </div>{""}
                      </div>{""}
                      <div className="overflow-y-auto flex-1 pb-6 hide-scrollbar">
                        {""}
                        {activeBusinesses
                          .filter(
                            (b) =>
                              b.name
                                .toLowerCase()
                                .includes(businessSearch.toLowerCase()) ||
                              b.businessId
                                .toLowerCase()
                                .includes(businessSearch.toLowerCase()),
                          )
                          .map((b) => (
                            <div
                              key={b.id}
                              className="px-4 py-3 hover:bg-kite-bg active:bg-kite-bg cursor-pointer flex flex-col border-b border-kite-border last:border-0 transition-colors"
                              onClick={() => {
                                const reqFundFormatted = b.fundingRequired
                                  ? b.fundingRequired.toLocaleString("en-IN")
                                  :"";
                                setFormData({
                                  ...formData,
                                  businessId: b.id,
                                  amount: reqFundFormatted,
                                });
                                setShowBusinessSelect(false);
                              }}
                            >
                              {""}
                              <div className="flex items-center space-x-2">
                                {""}
                                <span className="font-medium text-[13px] md:text-[14px] text-kite-text uppercase">
                                  {""}
                                  {b.name?.toUpperCase()}{""}
                                </span>{""}
                                {blueTickBusinessIds.has(b.id) && (
                                  <BadgeCheck className="w-3.5 h-3.5 text-white fill-[#387ed1]" />
                                )}{""}
                              </div>{""}
                              <span className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                                {""}
                                Requires {formatINR(b.fundingRequired)} • ID: #{""}
                                {b.businessId}{""}
                              </span>{""}
                            </div>
                          ))}{""}
                        {activeBusinesses.filter(
                          (b) =>
                            b.name
                              .toLowerCase()
                              .includes(businessSearch.toLowerCase()) ||
                            b.businessId
                              .toLowerCase()
                              .includes(businessSearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="px-4 py-6 text-[13px] md:text-[14px] text-kite-text-light text-center">
                            {""}
                            No business found{""}
                          </div>
                        )}{""}
                      </div>{""}
                    </motion.div>{""}
                  </>
                )}{""}
              </AnimatePresence>{""}
              {/* Bottom Sheet: Investor Select */}{""}
              <AnimatePresence>
                {""}
                {showInvestorSelect && (
                  <>
                    {""}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 z-40"
                      onClick={() => setShowInvestorSelect(false)}
                    />{""}
                    <motion.div
                      initial={{ y:"100%" }}
                      animate={{ y: 0 }}
                      exit={{ y:"100%" }}
                      transition={{
                        type:"spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="absolute bottom-0 left-0 w-full bg-kite-surface rounded-t-[16px] z-50 flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                      {""}
                      <div className="flex justify-center pt-3 pb-2 shrink-0">
                        {""}
                        <div className="w-10 h-1 bg-kite-border rounded-full"></div>{""}
                      </div>{""}
                      <div className="px-4 pb-3 shrink-0 flex items-center justify-between border-b border-kite-border">
                        {""}
                        <h3 className="text-[15px] md:text-[16px] md:text-[16px] font-medium text-kite-text">
                          {""}
                          Select Investor{""}
                        </h3>{""}
                        <button
                          type="button"
                          onClick={() => setShowInvestorSelect(false)}
                          className="p-2 -mr-2 bg-kite-bg rounded-full text-kite-text-light"
                        >
                          {""}
                          <X className="w-4 h-4" />{""}
                        </button>{""}
                      </div>{""}
                      <div className="p-4 shrink-0">
                        {""}
                        <div className="relative border-b border-kite-border pb-1">
                          {""}
                          <Search className="w-4 h-4 absolute left-1 top-1 text-kite-text-muted" />{""}
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search investor..."
                            className="w-full pl-7 pr-4 py-1 bg-transparent text-[13px] md:text-[14px] text-kite-text outline-none placeholder-[#ccc]"
                            value={investorSearch}
                            onChange={(e) => setInvestorSearch(e.target.value)}
                          />{""}
                        </div>{""}
                      </div>{""}
                      <div className="overflow-y-auto flex-1 pb-6 hide-scrollbar">
                        {""}
                        {sortedInvestors
                          .filter(
                            (i) =>
                              i.name
                                .toLowerCase()
                                .includes(investorSearch.toLowerCase()) ||
                              i.investorId
                                .toLowerCase()
                                .includes(investorSearch.toLowerCase()),
                          )
                          .map((i) => (
                            <div
                              key={i.id}
                              className="px-4 py-3 hover:bg-kite-bg active:bg-kite-bg cursor-pointer flex flex-col border-b border-kite-border last:border-0 transition-colors"
                              onClick={() => {
                                setFormData({ ...formData, investorId: i.id });
                                setShowInvestorSelect(false);
                              }}
                            >
                              {""}
                              <div className="flex items-center justify-between">
                                {""}
                                <span className="font-medium text-[13px] md:text-[14px] text-kite-text uppercase">
                                  {""}
                                  {i.name?.toUpperCase()}{""}
                                </span>{""}
                                {getActiveInvestmentCount(i.id) > 0 && (
                                  <span className="text-[10px] md:text-[11px] bg-kite-border text-kite-text font-medium px-1.5 py-0.5 rounded-[4px]">
                                    {""}
                                    pending{""}
                                    {getActiveInvestmentCount(i.id)}{""}
                                  </span>
                                )}{""}
                              </div>{""}
                              <span className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
                                {""}
                                ID: #{i.investorId}{""}
                              </span>{""}
                            </div>
                          ))}{""}
                        {sortedInvestors.filter(
                          (i) =>
                            i.name
                              .toLowerCase()
                              .includes(investorSearch.toLowerCase()) ||
                            i.investorId
                              .toLowerCase()
                              .includes(investorSearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="px-4 py-6 text-[13px] md:text-[14px] text-kite-text-light text-center">
                            {""}
                            No investor found{""}
                          </div>
                        )}{""}
                      </div>{""}
                    </motion.div>{""}
                  </>
                )}{""}
              </AnimatePresence>{""}
            </motion.div>{""}
          </div>
        )}{""}
      </AnimatePresence>{""}
      <div
        className={`w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden ${showAddForm ?"hidden md:block" :"block"}`}
      >
        {""}
        <div className="flex flex-col divide-y divide-kite-border border-b border-kite-border pb-16">
          {""}
          {groupedInvestments.map((inv: any) => {
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
                key={inv.key}
                className="w-full flex flex-col px-4 py-3 hover:bg-gray-50 border-b border-kite-border-soft transition-colors cursor-pointer group font-sans"
                onClick={() => {
                  setSelectedInvestment(inv);
                  setSelectedInvestmentIds(
                    inv.groupedInvestmentsList.map((i: any) => i.id),
                  );
                  setWithdrawStep(0);
                }}
              >
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
                    style={{ fontFamily: '"Inter", sans-serif' }}
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
      {/* Details Modal */}{""}
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
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-kite-bg md:bg-gray-900/60 dark:md:bg-gray-900/80 p-0 md:p-4">
              {""}
              <div className="bg-kite-bg md:rounded w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl flex flex-col overflow-hidden relative">
                {""}
                <div className="shrink-0 bg-kite-surface border-b border-kite-border px-3 py-2 md:px-4 md:py-3 flex justify-between items-center z-10">
                  {""}
                  <div className="flex items-center space-x-2">
                    {""}
                    <button
                      onClick={() => setSelectedInvestment(null)}
                      className="p-2 -ml-2 text-kite-text hover:bg-gray-50 rounded-full transition-colors"
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
                          className="p-2 -mr-2 text-kite-text hover:bg-gray-50 rounded-full transition-colors"
                        >
                          {""}
                          <MoreVertical className="w-[24px] h-[24px]" />{""}
                        </button>{""}
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
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-kite-blue hover:bg-kite-bg transition-colors"
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
                                    setSelectedInvestment(null);
                                    setShowAddForm(true);
                                  }}
                                >
                                  {""}
                                  BUY{""}
                                </button>{""}
                                <button
                                  className="w-full text-center px-3 py-2 text-[13px] md:text-[14px] font-medium text-[#D94B4B] hover:bg-kite-bg transition-colors border-t border-kite-border"
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
                              (invUnit: any) => {
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
                                    key={invUnit.id}
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
                  )}{""}
                {withdrawStep === 1 && (
                  <div className="shrink-0 p-3 md:p-4 z-20">
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
                      <SwipeButton
                        text="SWIPE TO SELL"
                        successText="SETTLING..."
                        actionType="SELL"
                        onSuccess={handleConfirmWithdraw}
                      />{""}
                    </div>{""}
                  </div>
                )}{""}
              </div>{""}
            </div>
          );
        })()}{""}
      <AnimatePresence>
        {""}
        {showSuccessAnimation && successData && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type:"spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-4 right-0 left-0 mx-4 md:left-auto md:right-8 md:mx-0 z-50 bg-kite-surface shadow-lg rounded-sm border-l-4 border-kite-blue p-4 max-w-sm flex items-start space-x-3"
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
                Investment Booked{""}
              </h3>{""}
              <p className="text-[11px] md:text-[12px] text-kite-text-light mt-1 flex flex-col space-y-0.5">
                {""}
                <span>{successData.investorName?.toUpperCase()}</span>{""}
                <span>
                  {""}
                  {formatINR(successData.amount)} to{""}
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
