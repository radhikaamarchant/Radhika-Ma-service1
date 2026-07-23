import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle,
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  Users,
} from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { Investment } from "../types";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { getCurrentMarketPrice } from "../utils/marketSimulator";

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
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");
  const [orderTab, setOrderTab] = useState<"REGULAR" | "CAP">("REGULAR");
  const [inputMode, setInputMode] = useState<"AMOUNT" | "QTY">("AMOUNT");
  const [shakeQuantity, setShakeQuantity] = useState(false);
  const [formData, setFormData] = useState({
    businessId: initialBusinessId,
    investorIds: [] as string[],
    amount: "",
    quantity: "" as any,
    timePeriodMonths: "12",
    adminCommissionInvestorPct: "2",
    adminCommissionBusinessPct: "2",
  });

  const [expectedRoi, setExpectedRoi] = useState("12");
  const [priceType, setPriceType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [manualPrice, setManualPrice] = useState("");

  const [desktopShowBusinessSelect, setDesktopShowBusinessSelect] =
    useState(false);
  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] =
    useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isInvestorMultiSelect, setIsInvestorMultiSelect] = useState(false);

  useMobileBackNavigation(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      const initialBusiness = state.businesses.find(
        (b) => b.id === initialBusinessId,
      );
      const isTrigger = initialBusiness?.investmentType === "trigger";
      const minQty = initialBusiness?.triggerMinQuantity || 1;
      const defaultAmount =
        isTrigger && initialBusiness?.triggerAmount
          ? new Intl.NumberFormat("en-IN").format(
              getCurrentMarketPrice(initialBusiness, state.investments) *
                minQty,
            )
          : "";

      setFormData({
        businessId: initialBusinessId,
        investorIds: initialInvestorId ? [initialInvestorId] : [],
        amount: defaultAmount,
        quantity: minQty,
        timePeriodMonths: "12",
        adminCommissionInvestorPct: "2",
        adminCommissionBusinessPct: "2",
      });
      const liveRoi = marketState.trends[initialBusinessId];
      setExpectedRoi(liveRoi !== undefined ? liveRoi.toFixed(2) : "12");
      setOrderMode("BUY");
      setIsInvestorMultiSelect(false);
    }
  }, [isOpen, initialBusinessId, initialInvestorId]);

  const selectedBusiness = state.businesses.find(
    (b) => b.id === formData.businessId,
  );

  const selectedInvestors = state.investors.filter((i) =>
    formData.investorIds.includes(i.id),
  );

  const getRawAmount = (formattedValue: string) => {
    return parseFloat(formattedValue.replace(/,/g, "")) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";
    setFormData({ ...formData, amount: formatted });
  };

  
  const calculateSellStats = () => {
    let totalCap = 0;
    let totalProfit = 0;
    const qty = parseInt(formData.quantity) || 0;
    if (qty > 0 && selectedBusiness && formData.investorIds.length > 0) {
      // Split qty evenly among selected investors (or just use average price across all their active)
      let overallActiveAmount = 0;
      let overallActiveQty = 0;
      formData.investorIds.forEach(invId => {
        const activeInvs = state.investments.filter((inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active");
        activeInvs.forEach((inv: any) => {
          overallActiveAmount += inv.amount;
          overallActiveQty += (Number(inv.quantity) || (selectedBusiness.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1);
        });
      });
      if (overallActiveQty > 0) {
        const avgPrice = overallActiveAmount / overallActiveQty;
        totalCap = avgPrice * qty;
        const trend = marketState?.trends?.[selectedBusiness.id] || 0;
        totalProfit = totalCap * (trend / 100);
      }
    }
    return { capUsed: totalCap, profit: totalProfit };
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

  useKeyboardShortcuts(
    {
      enter: (e) => {
        if (!isBooking && selectedBusiness && selectedInvestors.length > 0) {
          e.preventDefault();
          handleAddSubmit(e as any);
        }
      },
      "shift+enter": (e) => {
        if (!isBooking && selectedBusiness && selectedInvestors.length > 0) {
          e.preventDefault();
          handleAddSubmit(e as any);
        }
      },
      shift: (e) => {
        if (!isBooking && selectedBusiness && selectedInvestors.length > 0) {
          e.preventDefault();
          handleAddSubmit(e as any);
        }
      },
    },
    isOpen,
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || formData.investorIds.length === 0) {
      alert("Please select both a business and at least one investor.");
      return;
    }
    const amount = getRawAmount(formData.amount);
    if (amount <= 0) return;

    const comms = calculateCommissions();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(formData.timePeriodMonths));

    setIsBooking(true);
    setTimeout(() => {
      
      if (orderMode === "SELL") {
        formData.investorIds.forEach((invId) => {
          let remainingQtyToSell = parseInt(formData.quantity) || 0;
          const activeInvs = state.investments.filter(
            (inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active"
          ).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

          for (const inv of activeInvs) {
            if (remainingQtyToSell <= 0) break;
            const invQty = Number(inv.quantity) || (selectedBusiness.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1;
            if (invQty <= 0) continue;

            const ratio = Math.min(invQty, remainingQtyToSell) / (parseInt(formData.quantity) || 1);
            const rmasFee = comms.fromInvestor * ratio;
            const happyTax = comms.fromBusiness * ratio;
            
            if (invQty <= remainingQtyToSell) {
               remainingQtyToSell -= invQty;
               const trend = marketState?.trends?.[selectedBusiness.id] || 0;
               const grossPayout = inv.amount + (inv.amount * (trend / 100));
               dispatch({
                 type: "UPDATE_INVESTMENT",
                 payload: {
                   ...inv,
                   status: "completed",
                   payoutDetails: {
                     rmasCommission: rmasFee,
                     happyIncomeTax: happyTax,
                     totalCredited: grossPayout - rmasFee - happyTax,
                     payoutDate: new Date().toISOString().split("T")[0],
                     rmasMarketCover: 0
                   }
                 }
               });
            } else {
               const sellQty = remainingQtyToSell;
               const keepQty = invQty - sellQty;
               const avgPrice = inv.amount / invQty;
               const trend = marketState?.trends?.[selectedBusiness.id] || 0;
               const capUsed = avgPrice * sellQty;
               const profit = capUsed * (trend / 100);
               const grossPayout = capUsed + profit;
               
               dispatch({
                 type: "UPDATE_INVESTMENT",
                 payload: {
                   ...inv,
                   quantity: keepQty,
                   amount: avgPrice * keepQty
                 }
               });
               
               dispatch({
                 type: "ADD_INVESTMENT",
                 payload: {
                   ...inv,
                   id: `inv${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                   quantity: sellQty,
                   amount: avgPrice * sellQty,
                   status: "completed",
                   payoutDetails: {
                     rmasCommission: rmasFee,
                     happyIncomeTax: happyTax,
                     totalCredited: grossPayout - rmasFee - happyTax,
                     payoutDate: new Date().toISOString().split("T")[0],
                     rmasMarketCover: 0
                   }
                 }
               });
               
               remainingQtyToSell = 0;
            }
          }
        });
      } else {
        formData.investorIds.forEach((invId, idx) => {
          const newInvestment: Investment = {
            id: `inv${Date.now()}_${idx}`,
            businessId: formData.businessId,
            investorId: invId,
            amount: amount,
            quantity: formData.quantity,
            timePeriodMonths: parseInt(formData.timePeriodMonths),
            interestRate: parseFloat(expectedRoi) || selectedBusiness.interestRate,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            adminCommissionInvestor: comms.fromInvestor,
            adminCommissionBusiness: comms.fromBusiness,
            status: "active",
          };
          dispatch({ type: "ADD_INVESTMENT", payload: newInvestment });
        });
        if (amount >= selectedBusiness.fundingRequired) {
          dispatch({
            type: "UPDATE_BUSINESS_STATUS",
            payload: { id: formData.businessId, status: "funded" },
          });
        }
      }
      setIsBooking(false);
      onClose();
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

  const currentMarketPrice = selectedBusiness
    ? getCurrentMarketPrice(selectedBusiness, state.investments)
    : 0;

  const effectivePrice =
    priceType === "MARKET"
      ? currentMarketPrice
      : parseFloat(manualPrice) || currentMarketPrice;

  const desktopInputValue =
    inputMode === "AMOUNT" ? formData.amount : formData.quantity;

  const handleDesktopInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numeric = raw ? Number(raw) : 0;

    if (inputMode === "AMOUNT") {
      const qty = effectivePrice > 0 ? Math.floor(numeric / effectivePrice) : 0;
      setFormData({
        ...formData,
        amount: raw ? numeric.toLocaleString("en-IN") : "",
        quantity: qty || ("" as any),
      });
    } else {
      const amt = numeric * effectivePrice;
      setFormData({
        ...formData,
        quantity: raw ? numeric : ("" as any),
        amount: raw ? amt.toLocaleString("en-IN") : "",
      });
    }
  };

  const handleInputModeChange = (mode: "AMOUNT" | "QTY") => {
    setInputMode(mode);
  };

  const handlePriceTypeChange = (type: "MARKET" | "LIMIT") => {
    setPriceType(type);
    const newEffectivePrice =
      type === "MARKET"
        ? currentMarketPrice
        : parseFloat(manualPrice) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/\D/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN") : "",
      }));
    } else {
      const amt = parseFloat(formData.amount.replace(/,/g, "")) || 0;
      const qty =
        newEffectivePrice > 0 ? Math.floor(amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty || ("" as any) }));
    }
  };

  const handleManualPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualPrice(val);
    const newEffectivePrice = parseFloat(val) || currentMarketPrice;

    if (inputMode === "QTY") {
      const qty = parseFloat(String(formData.quantity).replace(/\D/g, "")) || 0;
      const amt = qty * newEffectivePrice;
      setFormData((prev) => ({
        ...prev,
        amount: amt ? amt.toLocaleString("en-IN") : "",
      }));
    } else {
      const amt = parseFloat(formData.amount.replace(/,/g, "")) || 0;
      const qty =
        newEffectivePrice > 0 ? Math.floor(amt / newEffectivePrice) : 0;
      setFormData((prev) => ({ ...prev, quantity: qty || ("" as any) }));
    }
  };

  const formatShortINR = (num: number) => {
    if (num >= 10000000) return `₹${+(num / 10000000).toFixed(2)}CR`;
    if (num >= 100000) return `₹${+(num / 100000).toFixed(2)}LK`;
    if (num >= 1000) return `₹${+(num / 1000).toFixed(2)}K`;
    return `₹${num}`;
  };

  const getTime = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
  const activeBusinesses = [...state.businesses].sort(
    (a, b) => getTime(b.id) - getTime(a.id),
  );
  const sortedInvestors = [...state.investors].sort(
    (a, b) =>
      new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime(),
  );

  if (!isOpen) return null;

  const maxSellQty = orderMode === "SELL" && selectedBusiness 
    ? formData.investorIds.reduce((total, invId) => {
        const activeInvs = state.investments.filter((inv: any) => inv.investorId === invId && inv.businessId === selectedBusiness.id && inv.status === "active");
        const invQty = activeInvs.reduce((sum, inv: any) => sum + (Number(inv.quantity) || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1), 0);
        return total + invQty;
      }, 0)
    : 0;

  const maxSellAmount = maxSellQty * (priceType === "MARKET" ? currentMarketPrice : (parseFloat(manualPrice) || currentMarketPrice));


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-bg"
          initial={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
          animate={isMobile ? { x: 0 } : { opacity: 1, scale: 1 }}
          exit={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
          transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
          className="hidden md:flex fixed inset-0 z-[200] bg-transparent items-center justify-center p-0 md:p-4 font-sans flex-col "
        >
          {isMobile ? (
            <motion.div
              className="w-full h-full md:h-auto max-w-[600px] bg-white dark:bg-[#111111] md:rounded-[8px] overflow-hidden flex flex-col font-sans border-0 md:border border-gray-200/50 dark:border-[#2A2A2A]/50 shadow-none"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopShowBusinessSelect(false);
                setDesktopShowInvestorSelect(false);
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A]/30 ">
                <div className="flex items-center gap-4">
                  {isMobile && (
                    <button
                      onClick={onClose}
                      className="p-1 -ml-2 text-gray-500"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setOrderMode("BUY");
                        setFormData({ ...formData, investorIds: [] });
                      }}
                      className={`px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "BUY" ? "bg-[#4184F3] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:md:hover:bg-[#131415]"}`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => {
                        setOrderMode("SELL");
                        setFormData({ ...formData, investorIds: [] });
                      }}
                      className={`px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "SELL" ? "bg-[#DF514C] dark:bg-[#E25F5B] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:md:hover:bg-[#131415]"}`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      FND:{" "}
                      {selectedBusiness
                        ? formatINR(selectedBusiness.fundingRequired || 0)
                        : "₹0"}
                    </span>
                    <span className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      INC:{" "}
                      {selectedBusiness
                        ? formatINR(
                            state.investments
                              .filter(
                                (inv: any) =>
                                  inv.businessId === selectedBusiness.id &&
                                  inv.status === "active",
                              )
                              .reduce(
                                (sum, inv) => sum + (Number(inv.amount) || 0),
                                0,
                              ),
                          )
                        : "₹0"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto hide-scrollbar">
                {/* Business/Investor Dropdowns Inline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 relative">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      Business
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesktopShowBusinessSelect(
                            !desktopShowBusinessSelect,
                          );
                          setDesktopShowInvestorSelect(false);
                        }}
                        className={`w-full flex items-center justify-between bg-white dark:bg-[#1B1B1B] border rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] transition-colors ${desktopShowBusinessSelect ? "border-[#4184F3]" : "border-gray-200 dark:border-[#2A2A2A] hover:border-[#4184F3]"}`}
                      >
                        <span className="truncate">
                          {selectedBusiness
                            ? selectedBusiness.name.toUpperCase()
                            : "Select Business"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 ml-2 transition-transform ${desktopShowBusinessSelect ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {desktopShowBusinessSelect && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search..."
                                  className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                  value={businessSearch}
                                  onChange={(e) =>
                                    setBusinessSearch(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pb-6">
                              {activeBusinesses
                                .filter((b) =>
                                  b.name
                                    .toLowerCase()
                                    .includes(businessSearch.toLowerCase()),
                                )
                                .map((b) => (
                                  <button
                                    key={b.id}
                                    onClick={() => {
                                      const isTrigger =
                                        b.investmentType === "trigger";
                                      const amount =
                                        isTrigger && b.triggerAmount
                                          ? new Intl.NumberFormat(
                                              "en-IN",
                                            ).format(
                                              getCurrentMarketPrice(
                                                b,
                                                state.investments,
                                              ),
                                            )
                                          : "";

                                      setFormData({
                                        ...formData,
                                        businessId: b.id,
                                        amount: amount,
                                      });
                                      const liveRoi = marketState.trends[b.id];
                                      setExpectedRoi(
                                        liveRoi !== undefined
                                          ? liveRoi.toFixed(2)
                                          : "12",
                                      );
                                      setDesktopShowBusinessSelect(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:md:hover:bg-[#131415] flex items-center justify-between"
                                  >
                                    {b.shortName
                                      ? b.shortName.toUpperCase()
                                      : b.name.toUpperCase()}
                                    {formData.businessId === b.id && (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      Investor
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesktopShowInvestorSelect(
                            !desktopShowInvestorSelect,
                          );
                          setDesktopShowBusinessSelect(false);
                        }}
                        className={`w-full flex items-center justify-between bg-white dark:bg-[#1B1B1B] border rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] transition-colors ${desktopShowInvestorSelect ? "border-[#4184F3]" : "border-gray-200 dark:border-[#2A2A2A] hover:border-[#4184F3]"}`}
                      >
                        <span className="truncate">
                          {selectedInvestors.length > 0
                            ? selectedInvestors.length === 1
                              ? <span className="capitalize">{selectedInvestors[0].name.toLowerCase()}</span>
                              : `${selectedInvestors.length} Investors Selected`
                            : "Select Investor"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 ml-2 transition-transform ${desktopShowInvestorSelect ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {desktopShowInvestorSelect && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0 flex flex-col gap-2">
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search by name or ID..."
                                  className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                  value={investorSearch}
                                  onChange={(e) =>
                                    setInvestorSearch(e.target.value)
                                  }
                                />
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
    e.stopPropagation();
    if (!isInvestorMultiSelect) {
      setIsInvestorMultiSelect(true);
      return;
    }
    const filteredIds = sortedInvestors
                                      .filter((i) => {
                                        if (
                                          !i.name
                                            .toLowerCase()
                                            .includes(
                                              investorSearch.toLowerCase(),
                                            ) &&
                                          !i.investorId
                                            ?.toLowerCase()
                                            .includes(
                                              investorSearch.toLowerCase(),
                                            )
                                        )
                                          return false;
                                        if (
                                          !isMobile &&
                                          orderMode === "SELL" &&
                                          selectedBusiness
                                        ) {
                                          const hasActive =
                                            state.investments.some(
                                              (inv: any) =>
                                                inv.investorId === i.id &&
                                                inv.businessId ===
                                                  selectedBusiness.id &&
                                                inv.status === "active",
                                            );
                                          if (!hasActive) return false;
                                        }
                                        return true;
                                      })
                                      .map((i) => i.id);

                                    if (
                                      filteredIds.every((id) =>
                                        formData.investorIds.includes(id),
                                      ) &&
                                      filteredIds.length > 0
                                    ) {
                                      setFormData({
                                        ...formData,
                                        investorIds:
                                          formData.investorIds.filter(
                                            (id) => !filteredIds.includes(id),
                                          ),
                                      });
                                    } else {
                                      const newSet = new Set([
                                        ...formData.investorIds,
                                        ...filteredIds,
                                      ]);
                                      setFormData({
                                        ...formData,
                                        investorIds: Array.from(newSet),
                                      });
                                    }
                                  }}
                                  className="text-[12px] text-[#4184F3] hover:underline font-medium"
                                >
  {isInvestorMultiSelect ? "Choose All" : "Choose"}
</button>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pb-6">
                              {sortedInvestors
                                .filter((i) => {
                                  if (
                                    !i.name
                                      .toLowerCase()
                                      .includes(investorSearch.toLowerCase()) &&
                                    !i.investorId
                                      ?.toLowerCase()
                                      .includes(investorSearch.toLowerCase())
                                  )
                                    return false;
                                  if (
                                    !isMobile &&
                                    orderMode === "SELL" &&
                                    selectedBusiness
                                  ) {
                                    const hasActive = state.investments.some(
                                      (inv: any) =>
                                        inv.investorId === i.id &&
                                        inv.businessId ===
                                          selectedBusiness.id &&
                                        inv.status === "active",
                                    );
                                    if (!hasActive) return false;
                                  }
                                  return true;
                                })
                                .map((i) => {
                                  const activeInvs = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active") : [];
  const activeCount = activeInvs.length;
  const totalQty = activeInvs.reduce((sum, inv: any) => sum + (Number(inv.quantity) || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1), 0);
                                  return (
                                    <button
                                      key={i.id}
                                      type="button"
                                      onClick={(e) => {
    e.stopPropagation();
    if (isInvestorMultiSelect) {
      const isSelected = formData.investorIds.includes(i.id);
      setFormData({
        ...formData,
        investorIds: isSelected
          ? formData.investorIds.filter((id) => id !== i.id)
          : [...formData.investorIds, i.id],
      });
    } else {
      setFormData({
        ...formData,
        investorIds: [i.id],
      });
      setDesktopShowInvestorSelect(false);
      setInvestorSearch("");
    }
  }}
                                      className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors flex items-center justify-between ${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#E3E3E3]"}`}
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        {i.photoUrl ? (
                                          <img
                                            src={i.photoUrl}
                                            alt={i.name}
                                            className="w-5 h-5 rounded-full object-cover shrink-0"
                                          />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#4184F3]/20 flex items-center justify-center text-[#4184F3] text-[10px] font-bold shrink-0">
                                            {i.name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="truncate">
                                          <span className="capitalize">{i.name.toLowerCase()}</span>
                                        </span>
                                        {activeCount > 0 && (
    <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex items-center justify-center shrink-0">
      {orderMode === "SELL" ? `${totalQty} Qty` : activeCount}
    </div>
  )}
                                      </div>
                                      <div className="flex items-center shrink-0 ml-2">
                                        {formData.investorIds.includes(
                                          i.id,
                                        ) && (
                                          <CheckCircle className="w-4 h-4 text-[#4184F3]" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              {sortedInvestors.filter(
                                (i) =>
                                  i.name
                                    .toLowerCase()
                                    .includes(investorSearch.toLowerCase()) ||
                                  i.investorId
                                    ?.toLowerCase()
                                    .includes(investorSearch.toLowerCase()),
                              ).length === 0 && (
                                <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                  No investors found
                                </div>
                              )}
                              <div className="h-6 w-full shrink-0" style={{ height: '24px', flexShrink: 0 }}></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      {selectedBusiness?.investmentType === "trigger" &&
                      isMobile
                        ? inputMode === "AMOUNT"
                          ? "Amount"
                          : "Quantity"
                        : "Amount"}
                    </label>
                    {selectedBusiness?.investmentType === "trigger" &&
                    isMobile ? (
                      <div className="flex items-center bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] overflow-hidden focus-within:border-[#4184F3] transition-colors w-full">
                        <input
                          type="text"
                          value={
                            inputMode === "AMOUNT"
                              ? formData.amount
                                ? `₹${formData.amount}`
                                : ""
                              : formData.quantity
                          }
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const numericValue = raw ? Number(raw) : 0;

                            if (inputMode === "AMOUNT") {
                              const formatted = raw
                                ? numericValue.toLocaleString("en-IN")
                                : "";
                              let calculatedQty = formData.quantity;
                              if (selectedBusiness.triggerAmount) {
                                calculatedQty = Math.floor(
                                  numericValue /
                                    getCurrentMarketPrice(
                                      selectedBusiness,
                                      state.investments,
                                    ),
                                );
                              }
                              setFormData({
                                ...formData,
                                amount: formatted,
                                quantity: calculatedQty || 0,
                              });
                            } else {
                              let qty = numericValue;
                              if (raw === "") qty = "" as any;
                              let calculatedAmount = formData.amount;
                              if (
                                selectedBusiness.triggerAmount &&
                                raw !== ""
                              ) {
                                calculatedAmount = (
                                  qty *
                                  getCurrentMarketPrice(
                                    selectedBusiness,
                                    state.investments,
                                  )
                                ).toLocaleString("en-IN");
                              }
                              setFormData({
                                ...formData,
                                quantity: qty,
                                amount: raw === "" ? "" : calculatedAmount,
                              });
                            }
                          }}
                          className="flex-1 px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none bg-transparent w-full min-w-0"
                        />
                        <div className="flex items-center gap-2 pr-3 shrink-0">
                          <span className="text-[12px] text-gray-400 dark:text-[#8F8F8F]">
                            {inputMode === "AMOUNT"
                              ? `${formData.quantity || 0} Qty`
                              : `₹${formData.amount || 0}`}
                          </span>
                          {orderMode === "BUY" && (<button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setInputMode(
                                inputMode === "AMOUNT" ? "QTY" : "AMOUNT",
                              );
                            }}
                            className="p-1 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded text-[#4184F3]"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>)}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.amount ? `₹${formData.amount}` : ""}
                        onChange={handleAmountChange}
                        disabled={
                          selectedBusiness?.investmentType === "trigger"
                        }
                        className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${selectedBusiness?.investmentType === "trigger" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-transparent" : ""}`}
                      />
                    )}
                  </div>
                  {selectedBusiness?.investmentType === "trigger" && (
                    <div
                      className={`${isMobile ? "hidden" : "flex-1 space-y-1.5"}`}
                    >
                      <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                        Quantity
                      </label>
                      <motion.input
                        type="number"
                        animate={
                          shakeQuantity ? { x: [-10, 10, -10, 10, 0] } : {}
                        }
                        transition={{ duration: 0.4 }}
                        placeholder="1"
                        min={selectedBusiness.triggerMinQuantity || 1}
                        max={selectedBusiness.triggerMaxQuantity || 9999}
                        value={formData.quantity}
                        onChange={(e) => {
                          const minQty =
                            selectedBusiness.triggerMinQuantity || 1;
                          const maxQty =
                            selectedBusiness.triggerMaxQuantity || 9999;
                          const rawVal = e.target.value;

                          if (rawVal === "") {
                            setFormData({
                              ...formData,
                              quantity: "" as any,
                              amount: "0",
                            });
                            return;
                          }

                          let qty = parseInt(rawVal);
                          if (isNaN(qty)) return;

                          if (qty > maxQty || qty < minQty) {
                            setShakeQuantity(true);
                            setTimeout(() => setShakeQuantity(false), 400);
                            if (qty > maxQty) qty = maxQty;
                          }

                          const newAmount =
                            qty *
                            (selectedBusiness.triggerAmount
                              ? getCurrentMarketPrice(
                                  selectedBusiness,
                                  state.investments,
                                )
                              : 0);
                          setFormData({
                            ...formData,
                            quantity: qty,
                            amount: new Intl.NumberFormat("en-IN").format(
                              newAmount,
                            ),
                          });
                        }}
                        onBlur={() => {
                          const minQty =
                            selectedBusiness.triggerMinQuantity || 1;
                          const maxQty =
                            selectedBusiness.triggerMaxQuantity || 9999;
                          let qty = parseInt(formData.quantity as any);
                          if (isNaN(qty) || qty < minQty) qty = minQty;
                          if (qty > maxQty) qty = maxQty;

                          const newAmount =
                            qty *
                            (selectedBusiness.triggerAmount
                              ? getCurrentMarketPrice(
                                  selectedBusiness,
                                  state.investments,
                                )
                              : 0);
                          setFormData({
                            ...formData,
                            quantity: qty,
                            amount: new Intl.NumberFormat("en-IN").format(
                              newAmount,
                            ),
                          });
                        }}
                        className="w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      manage month
                    </label>
                    <input
                      type="number"
                      value={formData.timePeriodMonths}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timePeriodMonths: e.target.value,
                        })
                      }
                      className="w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      Roi
                    </label>
                    <input
                      type="number"
                      value={expectedRoi}
                      onChange={(e) => setExpectedRoi(e.target.value)}
                      className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-transparent" : ""}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F] flex justify-between">
                      <span>{orderMode === "SELL" && orderTab === "CAP" ? "HPG Tax" : "BSE Brokrage"}</span>
                      {formData.amount &&
                        formData.adminCommissionBusinessPct &&
                        getRawAmount(formData.amount) > 0 &&
                        !isNaN(
                          parseFloat(formData.adminCommissionBusinessPct),
                        ) && (
                          <span className="text-[#4184F3] font-medium">
                            {formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionBusinessPct)) / 100) * Math.max(1, formData.investorIds.length))}
                          </span>
                        )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.adminCommissionBusinessPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminCommissionBusinessPct: e.target.value,
                        })
                      }
                      
                      className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-transparent" : ""}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F] flex justify-between">
                      <span>INC Brokrage</span>
                      {formData.amount &&
                        formData.adminCommissionInvestorPct &&
                        getRawAmount(formData.amount) > 0 &&
                        !isNaN(
                          parseFloat(formData.adminCommissionInvestorPct),
                        ) && (
                          <span className="text-[#4184F3] font-medium">
                            {formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionInvestorPct)) / 100) * Math.max(1, formData.investorIds.length))}
                          </span>
                        )}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.adminCommissionInvestorPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminCommissionInvestorPct: e.target.value,
                        })
                      }
                      
                      className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-transparent" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Bottom CTA for Mobile */}
              <div className="px-4 md:px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-[#2A2A2A]/30 mt-auto shrink-0 bg-white dark:bg-[#111111]">
                <button
                  onClick={onClose}
                  className="hidden md:block w-full md:w-auto px-6 py-2 rounded-[4px] text-[14px] font-medium text-gray-700 dark:text-[#C4C4C4] border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={
                    isBooking ||
                    !selectedBusiness ||
                    selectedInvestors.length === 0
                  }
                  className="w-full md:w-auto px-8 py-3 md:py-2 rounded-[4px] text-[15px] md:text-[14px] font-medium text-white bg-[#4184F3] hover:bg-[#3367D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : orderMode === "BUY" ? (
                    "BUY"
                  ) : (
                    "SELL"
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="w-full max-w-[680px] bg-white dark:bg-[#222222] rounded-[4px] shadow-2xl flex flex-col font-sans overflow-hidden border border-gray-200/50 dark:border-[#2A2A2A]/50"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopShowInvestorSelect(false);
              }}
            >
              <div
                className={`h-[70px] px-6 flex items-center justify-between transition-colors duration-300 ${orderMode === "BUY" ? "bg-[#4184F3] dark:bg-[#222222]" : "bg-[#FF5722] dark:bg-[#222222]"}`}
              >
                <div className="flex flex-col text-white">
                  <div className="flex items-center gap-[10px]">
                    <div className="text-[16px] dark:text-[14px] font-bold tracking-wide text-white dark:!text-[#BBBBBB]">
                      {selectedBusiness?.shortName?.toUpperCase() ||
                        selectedBusiness?.name?.toUpperCase() ||
                        "BUSINESS"}
                    </div>
                  </div>
                  <div className="flex gap-4 text-[11px] opacity-80 mt-0.5 text-white">
                    <span>
                      BSE {formatINR(currentMarketPrice)}
                    </span>
                    <span>
                      FND{" "}
                      {formatShortINR(selectedBusiness?.fundingRequired || 0)}
                    </span>
                    <span>
                      INC{" "}
                      {formatShortINR(
                        state.investments
                          .filter(
                            (inv) =>
                              inv.businessId === selectedBusiness?.id &&
                              inv.status === "active",
                          )
                          .reduce(
                            (sum, inv) => sum + (Number(inv.amount) || 0),
                            0,
                          ),
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={`relative inline-flex h-4 w-[34px] shrink-0 items-center rounded-full cursor-pointer transition-colors border border-white/20 hover:border-white/40 bg-black/10 ${orderMode === "BUY" ? "dark:!bg-[#4987EE]" : "dark:!bg-[#D4603B]"}`}
                  onClick={() => {
                    const newMode = orderMode === "BUY" ? "SELL" : "BUY";
  setOrderMode(newMode);
  if (newMode === "SELL") setInputMode("QTY");
                    setFormData({ ...formData, investorIds: [] });
                  }}
                >
                  <span
                    className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white transition-transform duration-300 shadow-sm ${orderMode === "BUY" ? "translate-x-[2px]" : "translate-x-[16px]"}`}
                  />
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-[#4444441A] border-b border-gray-200/50 dark:border-[#2A2A2A]/50 px-6 flex items-center gap-6 shrink-0">
                <button
                  onClick={() => setOrderTab("REGULAR")}
                  className={`text-[13px] font-medium py-3 border-b-2 transition-colors ${orderTab === "REGULAR" ? (orderMode === "BUY" ? "border-[#4184F3] text-[#4184F3] dark:text-[#4987EE] dark:border-[#4987EE]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]") : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-[#E3E3E3] dark:text-[#BBBBBB]"}`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setOrderTab("CAP")}
                  className={`text-[13px] font-medium py-3 border-b-2 transition-colors ${orderTab === "CAP" ? (orderMode === "BUY" ? "border-[#4184F3] text-[#4184F3] dark:text-[#4987EE] dark:border-[#4987EE]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]") : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-[#E3E3E3] dark:text-[#BBBBBB]"}`}
                >
                  Cap
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6 min-h-[200px]">
                {orderTab === "REGULAR" ? (
                  <div className="grid grid-cols-2 gap-x-[20px] gap-y-[20px] items-end">
                    <div className="flex flex-col justify-end">
                      <div className="space-y-1.5">
                        <div className="relative group w-full h-[44.5px]">
                          <label className={`flex items-center gap-[6px] absolute transition-all duration-200 z-10 font-sans pointer-events-none ${
                            desktopShowInvestorSelect || selectedInvestors.length > 0
                              ? "top-[-9px] left-[10px] text-[10.8px] px-[5px] bg-[#FFFFFF] dark:bg-[#222222] " + (desktopShowInvestorSelect ? (orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]") : "text-[#9B9B9B] dark:text-[#666666] group-focus-within:" + (orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"))
                              : "top-[13px] left-[15px] text-[13px] px-0 text-gray-400 bg-transparent"
                          }`}>
                            <Users className={desktopShowInvestorSelect || selectedInvestors.length > 0 ? "w-3 h-3" : "w-3.5 h-3.5"} /> Select Investor
                          </label>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!desktopShowInvestorSelect) {
                                setDesktopShowInvestorSelect(true);
                              }
                            }}
                            className={`w-full h-full flex items-center justify-between bg-transparent border rounded-[4px] px-[15px] py-[10px] text-[13px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors cursor-text ${desktopShowInvestorSelect ? (orderMode === "BUY" ? "border-[#4184F3]" : "border-[#FF5722]") : "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-400 dark:hover:border-gray-500"}`}
                          >
                            {desktopShowInvestorSelect ? (
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search by name or ID..."
                                className="flex-1 w-full h-full bg-transparent border-none outline-none text-[13px] text-gray-900 dark:text-[#FFFFFF]"
                                value={investorSearch}
                                onChange={(e) => setInvestorSearch(e.target.value)}
                              />
                            ) : (
                              <span className="truncate flex items-center gap-2 cursor-pointer">
                                {selectedInvestors.length > 0
                                  ? selectedInvestors.length === 1
                                    ? <span className="capitalize">{selectedInvestors[0].name.toLowerCase()}</span>
                                    : `${selectedInvestors.length} Investors Selected`
                                  : ""}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDesktopShowInvestorSelect(!desktopShowInvestorSelect);
                              }}
                              className="ml-2 outline-none flex items-center justify-center cursor-pointer"
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 dark:text-[#8F8F8F] shrink-0 transition-transform ${desktopShowInvestorSelect ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                          <AnimatePresence>
                            {desktopShowInvestorSelect && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0 flex flex-col gap-2">
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
    e.stopPropagation();
    if (!isInvestorMultiSelect) {
      setIsInvestorMultiSelect(true);
      return;
    }
    const filteredIds = sortedInvestors
                                          .filter((i) => {
                                            if (
                                              !i.name
                                                .toLowerCase()
                                                .includes(
                                                  investorSearch.toLowerCase(),
                                                ) &&
                                              !i.investorId
                                                ?.toLowerCase()
                                                .includes(
                                                  investorSearch.toLowerCase(),
                                                )
                                            )
                                              return false;
                                            if (
                                              !isMobile &&
                                              orderMode === "SELL" &&
                                              selectedBusiness
                                            ) {
                                              const hasActive =
                                                state.investments.some(
                                                  (inv) =>
                                                    inv.investorId === i.id &&
                                                    inv.businessId ===
                                                      selectedBusiness.id &&
                                                    inv.status === "active",
                                                );
                                              if (!hasActive) return false;
                                            }
                                            return true;
                                          })
                                          .map((i) => i.id);

                                        if (
                                          filteredIds.every((id) =>
                                            formData.investorIds.includes(id),
                                          ) &&
                                          filteredIds.length > 0
                                        ) {
                                          setFormData({
                                            ...formData,
                                            investorIds:
                                              formData.investorIds.filter(
                                                (id) =>
                                                  !filteredIds.includes(id),
                                              ),
                                          });
                                        } else {
                                          const newSet = new Set([
                                            ...formData.investorIds,
                                            ...filteredIds,
                                          ]);
                                          setFormData({
                                            ...formData,
                                            investorIds: Array.from(newSet),
                                          });
                                        }
                                      }}
                                      className="text-[12px] text-[#4184F3] hover:underline font-medium"
                                    >
  {isInvestorMultiSelect ? "Choose All" : "Choose"}
</button>
                                  </div>
                                </div>
                                <div className="flex-1 overflow-y-auto pb-6">
                                  {sortedInvestors
                                    .filter((i) => {
                                      if (
                                        !i.name
                                          .toLowerCase()
                                          .includes(
                                            investorSearch.toLowerCase(),
                                          ) &&
                                        !i.investorId
                                          ?.toLowerCase()
                                          .includes(
                                            investorSearch.toLowerCase(),
                                          )
                                      )
                                        return false;
                                      if (
                                        !isMobile &&
                                        orderMode === "SELL" &&
                                        selectedBusiness
                                      ) {
                                        const hasActive =
                                          state.investments.some(
                                            (inv) =>
                                              inv.investorId === i.id &&
                                              inv.businessId ===
                                                selectedBusiness.id &&
                                              inv.status === "active",
                                          );
                                        if (!hasActive) return false;
                                      }
                                      return true;
                                    })
                                    .map((i) => {
                                      const activeInvs = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active") : [];
  const activeCount = activeInvs.length;
  const totalQty = activeInvs.reduce((sum, inv: any) => sum + (Number(inv.quantity) || (selectedBusiness?.triggerAmount ? Math.floor(inv.amount / selectedBusiness.triggerAmount) : Math.floor(inv.amount / 100)) || 1), 0);
                                      return (
                                        <button
                                          key={i.id}
                                          type="button"
                                          onClick={(e) => {
    e.stopPropagation();
    if (isInvestorMultiSelect) {
      const isSelected = formData.investorIds.includes(i.id);
      setFormData({
        ...formData,
        investorIds: isSelected
          ? formData.investorIds.filter((id) => id !== i.id)
          : [...formData.investorIds, i.id],
      });
    } else {
      setFormData({
        ...formData,
        investorIds: [i.id],
      });
      setDesktopShowInvestorSelect(false);
      setInvestorSearch("");
    }
  }}
                                          className={`w-full text-left px-[15px] py-[10px] border-b border-gray-200 dark:border-[#333333] last:border-0 text-[13px] hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors flex items-center justify-between ${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#FFFFFF]"}`}
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            {i.photoUrl ? (
                                              <img
                                                src={i.photoUrl}
                                                alt={i.name}
                                                className="w-5 h-5 rounded-full object-cover shrink-0"
                                              />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#4184F3]/20 flex items-center justify-center text-[#4184F3] text-[10px] font-bold shrink-0">
                                                {i.name.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            <span className="truncate">
                                              <span className="capitalize">{i.name.toLowerCase()}</span>
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {activeCount > 0 && (
                                              <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex items-center justify-center shrink-0">
                                                {orderMode === "SELL" ? `${totalQty} Qty` : activeCount}
                                              </div>
                                            )}
                                            {formData.investorIds.includes(
                                              i.id,
                                            ) && (
                                              <CheckCircle className="w-4 h-4 text-[#4184F3]" />
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  {sortedInvestors.filter(
                                    (i) =>
                                      i.name
                                        .toLowerCase()
                                        .includes(
                                          investorSearch.toLowerCase(),
                                        ) ||
                                      i.investorId
                                        ?.toLowerCase()
                                        .includes(investorSearch.toLowerCase()),
                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                      No investors found
                                    </div>
                                  )}
                                  <div className="h-6 w-full shrink-0" style={{ height: '24px', flexShrink: 0 }}></div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end pb-[5px]">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              checked={priceType === "MARKET"}
                              onChange={() => handlePriceTypeChange("MARKET")}
                              className={
                                orderMode === "BUY"
                                  ? "accent-[#4184F3]"
                                  : "accent-[#FF5722]"
                              }
                            />
                            <span className="text-[12px] text-gray-700 dark:text-[#BBBBBB]">
                              Market
                            </span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              checked={priceType === "LIMIT"}
                              onChange={() => handlePriceTypeChange("LIMIT")}
                              className={
                                orderMode === "BUY"
                                  ? "accent-[#4184F3]"
                                  : "accent-[#FF5722]"
                              }
                            />
                            <span className="text-[12px] text-gray-700 dark:text-[#BBBBBB]">
                              Limit
                            </span>
                          </label>
                        </div>
                    </div>
                    <div className="relative group w-[172.18px] h-[44.5px]">
                        <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                          {inputMode === "QTY" ? "Qty." : "Amount"}
                        </label>
                        <div className="relative w-[172.18px] h-[44.5px]">
                          <input
                            type="text"
                            value={desktopInputValue}
                            onChange={handleDesktopInputChange}
                            className={`w-full h-full pl-[15px] pr-[40px] py-[10px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                          />
                          {orderMode === "BUY" && (<button
                            type="button"
                            onClick={() =>
                              handleInputModeChange(
                                inputMode === "QTY" ? "AMOUNT" : "QTY",
                              )
                            }
                            className="absolute right-0 top-0 h-full w-[34.7px] p-[14px_7px] flex items-center justify-center bg-[#F8F8F8] dark:bg-[#1E1E1E] hover:bg-[#EBEBEB] dark:hover:bg-[#2A2A2A] text-gray-500 cursor-pointer rounded-r-[3.5px] border-l border-gray-200 dark:border-[#2A2A2A] transition-colors"
                          >
                            {inputMode === "QTY" ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 12 12 17 22 12"></polyline>
                                <polyline points="2 17 12 22 22 17"></polyline>
                              </svg>
                            ) : (
                              <span className="font-semibold text-[14px]">
                                ₹
                              </span>
                            )}
                          </button>)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8F8F8F] absolute -bottom-5 whitespace-nowrap">
                          {inputMode === "AMOUNT"
                            ? `${formData.quantity || 0} qty.`
                            : `₹${formData.amount || 0}`}
                          {orderMode === "SELL" && selectedBusiness && formData.investorIds.length > 0 && (
                            <span className="ml-1.5 text-[#FF5722] dark:text-[#D4603B]">
                              + Max: {maxSellQty} Qty
                            </span>
                          )}
                        </div>
                    </div>
                    <div className="relative group w-[172.18px] h-[44.5px]">
                        <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                          Price
                        </label>
                        <input
                          type="number"
                          disabled={priceType === "MARKET"}
                          value={
                            priceType === "MARKET"
                              ? currentMarketPrice
                              : manualPrice
                          }
                          onChange={handleManualPriceChange}
                          className={`w-full h-full p-[10px_15px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-[#111111] disabled:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                        />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-[20px] items-start">
                    <div className="relative group w-[172.18px] h-[44.5px]">
                      <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                        Manage Month
                      </label>
                      <input
                        type="number"
                        value={formData.timePeriodMonths}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timePeriodMonths: e.target.value,
                          })
                        }
                        className={`w-full h-full p-[10px_15px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                      />
                    </div>
                    <div className="relative group w-[172.18px] h-[44.5px]">
                      <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                        Roi
                      </label>
                      <input
                        type="number"
                        value={expectedRoi}
                        onChange={(e) => setExpectedRoi(e.target.value)}
                        className={`w-full h-full p-[10px_15px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-[#111111] disabled:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                      />
                    </div>
                    <div>
                      <div className="relative group w-[172.18px] h-[44.5px]">
                        <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                          {orderMode === "SELL" && orderTab === "CAP" ? "HPG Tax" : "BSE Brokrage"}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.adminCommissionBusinessPct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminCommissionBusinessPct: e.target.value,
                            })
                          }
                          className={`w-full h-full p-[10px_15px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors disabled:opacity-50 hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                        />
                      </div>
                      {formData.amount &&
                        formData.adminCommissionBusinessPct &&
                        getRawAmount(formData.amount) > 0 &&
                        !isNaN(
                          parseFloat(formData.adminCommissionBusinessPct),
                        ) && (
                          <span className="text-[#4184F3] font-medium text-[12px] mt-[4px] block text-right w-[172.18px]">
                            {formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionBusinessPct)) / 100) * Math.max(1, formData.investorIds.length))}
                          </span>
                      )}
                    </div>
                    <div>
                      <div className="relative group w-[172.18px] h-[44.5px]">
                        <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] dark:text-[#666666] bg-[#FFFFFF] dark:bg-[#222222] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                          INC Brokrage
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.adminCommissionInvestorPct}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adminCommissionInvestorPct: e.target.value,
                            })
                          }
                          className={`w-full h-full p-[10px_15px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[19px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-colors disabled:opacity-50 hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                        />
                      </div>
                      {formData.amount &&
                        formData.adminCommissionInvestorPct &&
                        getRawAmount(formData.amount) > 0 &&
                        !isNaN(
                          parseFloat(formData.adminCommissionInvestorPct),
                        ) && (
                          <span className="text-[#4184F3] font-medium text-[12px] mt-[4px] block text-right w-[172.18px]">
                            {formatINR(((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionInvestorPct)) / 100) * Math.max(1, formData.investorIds.length))}
                          </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[61.8px] bg-gray-50/50 dark:bg-[#141414] px-6 border-t border-gray-100 dark:border-[#2A2A2A]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1 text-[13px] text-gray-700 dark:text-[#BBBBBB]">
                  <span>{orderMode === "SELL" ? "Cap" : "Required"}</span>
                  <span className="font-medium text-[#4184F3]">
                    {orderMode === "SELL" ? (
                      <>
                        ₹{(calculateSellStats().capUsed * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {(calculateCommissions().totalAdmin * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} <span className="text-[#4CAF50] dark:text-[#5B9A5D] ml-2">Profit: ₹{(calculateSellStats().profit * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                      </>
                    ) : (
                      <>
                        ₹{(getRawAmount(formData.amount) * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })} + {(calculateCommissions().totalAdmin * Math.max(1, formData.investorIds.length)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </>
                    )}
                  </span>
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-[10px]">
                  <button
                    onClick={handleAddSubmit}
                    disabled={
                      isBooking ||
                      !selectedBusiness ||
                      selectedInvestors.length === 0
                    }
                    className={`w-[75px] h-[36.8px] p-[10px_20px] rounded-[4px] text-[14px] font-medium text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${orderMode === "BUY" ? "bg-[#4184F3] dark:bg-[#4987EE] hover:bg-[#3367D6]" : "bg-[#FF5722] dark:bg-[#D4603B] hover:bg-[#E64A19]"}`}
                  >
                    {isBooking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                        Booking
                      </>
                    ) : orderMode === "BUY" ? (
                      "Buy"
                    ) : (
                      "Sell"
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-[87.77px] h-[36.8px] flex items-center justify-center p-[10px_20px] rounded-[4px] border border-gray-200 dark:border-[#444444] text-[14.8px] font-medium text-gray-700 dark:text-[#BBBBBB] dark:bg-transparent hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
