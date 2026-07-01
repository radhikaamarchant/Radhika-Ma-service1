import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronDown, CheckCircle, Search, RefreshCw } from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { Investment } from "../types";
import { calculateLiveProfit as globalCalculateLiveProfit } from "../utils/profitCalculator";
import { useMarketSimulation } from "../utils/MarketSimulationContext";

export default function AddInvestmentModal({
  isOpen,
  onClose,
  initialBusinessId,
  initialInvestorId,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialBusinessId: string;
  initialInvestorId?: string;
}) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  
  const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");
  const [payoutFreq, setPayoutFreq] = useState("Monthly");

  const [formData, setFormData] = useState({
    businessId: initialBusinessId,
    investorId: "",
    amount: "",
    timePeriodMonths: "12",
    adminCommissionInvestorPct: "2",
    adminCommissionBusinessPct: "2",
  });
  
  const [expectedRoi, setExpectedRoi] = useState("12");
  
  const [showInvestorSelect, setShowInvestorSelect] = useState(false);
  const [desktopShowBusinessSelect, setDesktopShowBusinessSelect] = useState(false);
  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        businessId: initialBusinessId,
        investorId: initialInvestorId || "",
        amount: "",
        timePeriodMonths: "12",
        adminCommissionInvestorPct: "2",
        adminCommissionBusinessPct: "2",
      });
      setExpectedRoi("12");
      setOrderMode("BUY");
    }
  }, [isOpen, initialBusinessId, initialInvestorId]);

  const selectedBusiness = state.businesses.find(
    (b) => b.id === formData.businessId,
  );
  
  const selectedInvestor = state.investors.find(
    (i) => i.id === formData.investorId,
  );

  const getRawAmount = (formattedValue: string) => {
    return parseFloat(formattedValue.replace(/,/g, "")) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";
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
      interestRate: parseFloat(expectedRoi) || selectedBusiness.interestRate,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      adminCommissionInvestor: comms.fromInvestor,
      adminCommissionBusiness: comms.fromBusiness,
      status: "active",
    };
    setIsBooking(true);
    setTimeout(() => {
      dispatch({ type: "ADD_INVESTMENT", payload: newInvestment });
      if (amount >= selectedBusiness.fundingRequired) {
        dispatch({
          type: "UPDATE_BUSINESS_STATUS",
          payload: { id: formData.businessId, status: "funded" },
        });
      }
      setIsBooking(false);
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setFormData({
          businessId: initialBusinessId,
          investorId: "",
          amount: "",
          timePeriodMonths: "12",
          adminCommissionInvestorPct: "2",
          adminCommissionBusinessPct: "2",
        });
        onClose();
      }, 3000);
    }, 600);
  };
  
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeBusinesses = state.businesses.filter(b => b.status === "active" || b.status === "funded");
  const sortedInvestors = [...state.investors].sort((a, b) => a.name.localeCompare(b.name));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="hidden md:flex fixed inset-0 z-[200] bg-black/60 items-center justify-center p-4 font-sans"
            onClick={() => onClose()}
          >
            <div 
               className="w-full max-w-[600px] bg-white dark:bg-[#111111] rounded-[8px] overflow-hidden flex flex-col font-sans border border-gray-200/50 dark:border-[#2A2A2A]/50 shadow-none"
               onClick={(e) => { e.stopPropagation(); setDesktopShowBusinessSelect(false); setDesktopShowInvestorSelect(false); }}
            >
               {/* Header */}
               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A]/30">
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => setOrderMode("BUY")}
                       className={`px-6 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "BUY" ? "bg-[#4184F3] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"}`}
                     >
                       BUY
                     </button>
                     <button 
                       onClick={() => setOrderMode("SELL")}
                       className={`px-6 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "SELL" ? "bg-[#FF5722] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"}`}
                     >
                       SELL
                     </button>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-4">
                        <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                           FND: {selectedBusiness ? formatINR(selectedBusiness.fundingRequired || 0) : "₹0"}
                        </span>
                        <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                           INC: {selectedBusiness ? formatINR(state.investments.filter((inv: any) => inv.businessId === selectedBusiness.id && inv.status === "active").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)) : "₹0"}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="p-6 space-y-6 bg-white dark:bg-[#111111] max-h-[60vh] overflow-y-auto hide-scrollbar">
                  {/* Business/Investor Dropdowns Inline */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1.5 relative">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Business</label>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDesktopShowBusinessSelect(!desktopShowBusinessSelect); setDesktopShowInvestorSelect(false); }}
                            className={`w-full flex items-center justify-between bg-white dark:bg-[#1B1B1B] border rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] transition-colors ${desktopShowBusinessSelect ? "border-[#4184F3]" : "border-gray-200 dark:border-[#2A2A2A] hover:border-[#4184F3]"}`}
                          >
                            <span className="truncate">{selectedBusiness ? selectedBusiness.name.toUpperCase() : "Select Business"}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 ml-2 transition-transform ${desktopShowBusinessSelect ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {desktopShowBusinessSelect && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]" onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                                  <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                                    <input
                                      type="text" autoFocus placeholder="Search..."
                                      className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                      value={businessSearch} onChange={(e) => setBusinessSearch(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto flex-1 hide-scrollbar">
                                  {activeBusinesses
                                    .filter(b => orderMode === "BUY" || state.investments.some(inv => inv.businessId === b.id && inv.status === "active"))
                                    .filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(businessSearch.toLowerCase()))
                                    .map((b, idx) => (
                                      <div
                                        key={`desk_sel_biz_${b.id}`}
                                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] cursor-pointer flex flex-col border-b border-gray-50 dark:border-[#2A2A2A]/50 last:border-0"
                                        onClick={() => {
                                          const reqFundFormatted = b.fundingRequired ? b.fundingRequired.toLocaleString("en-IN") : "";
                                          setFormData({ ...formData, businessId: b.id, amount: reqFundFormatted, investorId: "" });
                                          setDesktopShowBusinessSelect(false);
                                        }}
                                      >
                                        <span className="font-medium text-[13px] text-gray-900 dark:text-[#E3E3E3] uppercase">{b.name?.toUpperCase()}</span>
                                        <span className="text-[11px] text-gray-500 dark:text-[#8F8F8F] mt-0.5">Requires {formatINR(b.fundingRequired)}</span>
                                      </div>
                                    ))}
                                  {activeBusinesses.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-gray-500">No businesses found</div>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                     </div>
                     <div className="space-y-1.5 relative">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Investor</label>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDesktopShowInvestorSelect(!desktopShowInvestorSelect); setDesktopShowBusinessSelect(false); }}
                            className={`w-full flex items-center justify-between bg-white dark:bg-[#1B1B1B] border rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] transition-colors ${desktopShowInvestorSelect ? "border-[#4184F3]" : "border-gray-200 dark:border-[#2A2A2A] hover:border-[#4184F3]"}`}
                          >
                            <span className="truncate">{selectedInvestor ? selectedInvestor.name.toUpperCase() : "Select Investor"}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 ml-2 transition-transform ${desktopShowInvestorSelect ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {desktopShowInvestorSelect && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]" onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                                  <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                                    <input
                                      type="text" autoFocus placeholder="Search..."
                                      className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                      value={investorSearch} onChange={(e) => setInvestorSearch(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto flex-1 hide-scrollbar">
                                  {sortedInvestors
                                    .filter(i => orderMode === "BUY" || state.investments.some(inv => inv.investorId === i.id && inv.businessId === selectedBusiness?.id && inv.status === "active"))
                                    .filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(investorSearch.toLowerCase()))
                                    .map((i, idx) => {
                                      const activeCount = selectedBusiness ? state.investments.filter(inv => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : state.investments.filter(inv => inv.investorId === i.id && inv.status === "active").length;
                                      return (
                                        <div
                                          key={`desk_sel_inv_${i.id}`}
                                          className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] cursor-pointer flex items-center justify-between border-b border-gray-50 dark:border-[#2A2A2A]/50 last:border-0"
                                          onClick={() => {
                                            setFormData({ ...formData, investorId: i.id });
                                            if (orderMode === "SELL") {
                                              const activeGroupedInvestments = state.investments.filter(
                                                (inv) => inv.businessId === selectedBusiness?.id && inv.investorId === i.id && inv.status === "active"
                                              );
                                              if (activeGroupedInvestments.length > 0) {
                                                const totalAmount = activeGroupedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                                                setFormData(prev => ({ ...prev, amount: totalAmount.toLocaleString("en-IN") }));
                                              }
                                            }
                                            setDesktopShowInvestorSelect(false);
                                          }}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium text-[13px] text-gray-900 dark:text-[#E3E3E3] uppercase">{i.name?.toUpperCase()}</span>
                                            <span className="text-[11px] text-gray-500 dark:text-[#8F8F8F] mt-0.5">ID: #{i.investorId}</span>
                                          </div>
                                          {activeCount > 0 && (
                                            <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center justify-center min-w-[16px] h-[16px]">
                                              {activeCount}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  {sortedInvestors.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-gray-500">No investors found</div>}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                     </div>
                  </div>

                  {/* Inputs Row */}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                     <div className="space-y-1.5">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Amount</label>
                        <input 
                          type="text" 
                          value={formData.amount}
                          onChange={handleAmountChange}
                          disabled={orderMode === "SELL"}
                          className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Duration (Months)</label>
                        <input 
                          type="number" 
                          value={formData.timePeriodMonths}
                          onChange={(e) => setFormData({ ...formData, timePeriodMonths: e.target.value })}
                          disabled={orderMode === "SELL"}
                          className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-2 border-t border-gray-50 dark:border-[#2A2A2A]/30 mt-4 pt-4">
                     <div className="space-y-1.5">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Expected ROI (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={expectedRoi}
                          onChange={(e) => setExpectedRoi(e.target.value)}
                          disabled={orderMode === "SELL"}
                          className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Business Brokerage (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={formData.adminCommissionBusinessPct}
                          onChange={(e) => setFormData({ ...formData, adminCommissionBusinessPct: e.target.value })}
                          disabled={orderMode === "SELL"}
                          className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">Investor Brokerage (%)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={formData.adminCommissionInvestorPct}
                          onChange={(e) => setFormData({ ...formData, adminCommissionInvestorPct: e.target.value })}
                          disabled={orderMode === "SELL"}
                          className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                        />
                     </div>
                  </div>
               </div>

               {/* Bottom Actions */}
               <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-[#2A2A2A]/30">
                  <div className="flex gap-4">
                     <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                        Required <span className={orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}>{formatINR(orderMode === "SELL" ? getRawAmount(formData.amount) : calculateCommissions().netInvestment)}</span>
                     </span>
                     <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F] flex items-center gap-1">
                        Brokerage <span className="text-[#4184F3]">{formatINR(calculateCommissions().totalAdmin)}</span>
                     </span>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={(e) => {
                          if (orderMode === "BUY") {
                             handleAddSubmit(e as any);
                          } else {
                             if (!selectedBusiness || !selectedInvestor) return;
                             setIsBooking(true);
                             const activeGroupedInvestments = state.investments.filter(
                                (i) => i.businessId === selectedBusiness.id && i.investorId === selectedInvestor.id && i.status === "active"
                             );
                             if (activeGroupedInvestments.length === 0) { setIsBooking(false); return; }
                             const { liveProfit } = globalCalculateLiveProfit(activeGroupedInvestments, selectedBusiness.id, marketState.trends, state.settings);
                             const totalAmount = activeGroupedInvestments.reduce((sum, i) => sum + i.amount, 0);
                             const rmasFee = liveProfit > 0 ? (liveProfit * state.settings.rmasProfitCommissionPct) / 100 : 0;
                             const happyTax = liveProfit > 0 ? (liveProfit * state.settings.happyIncomeTaxPct) / 100 : 0;
                             const totalCredited = totalAmount + liveProfit - rmasFee - happyTax;

                             setTimeout(() => {
                                activeGroupedInvestments.forEach((invToUpdate) => {
                                  const ratio = invToUpdate.amount / totalAmount;
                                  dispatch({
                                    type: "UPDATE_INVESTMENT",
                                    payload: {
                                      ...invToUpdate,
                                      status: "completed",
                                      payoutDetails: {
                                        rmasCommission: rmasFee * ratio,
                                        happyIncomeTax: happyTax * ratio,
                                        rmasPrematurePenalty: 0,
                                        totalCredited: totalCredited * ratio,
                                        payoutDate: new Date().toISOString().split("T")[0],
                                      },
                                    },
                                  });
                                });
                                setIsBooking(false);
                                setShowSuccessAnimation(true);
                                onClose();
                                setTimeout(() => setShowSuccessAnimation(false), 2000);
                             }, 800);
                          }
                       }}
                       disabled={isBooking}
                       className={`px-8 py-2 text-[14px] font-medium text-white rounded-[4px] transition-colors relative ${orderMode === "BUY" ? "bg-[#4184F3] hover:bg-blue-600" : "bg-[#FF5722] hover:bg-orange-600"} disabled:opacity-70`}
                     >
                       {isBooking ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mx-auto"></div> : orderMode}
                     </button>
                     <button 
                       onClick={() => onClose()}
                       className="px-6 py-2 text-[14px] font-medium text-gray-700 dark:text-[#E3E3E3] border border-gray-300 dark:border-[#2A2A2A] rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                     >
                       Cancel
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}
