import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle,
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
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
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [orderMode, setOrderMode] = useState<"BUY" | "SELL">("BUY");
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

  const [desktopShowBusinessSelect, setDesktopShowBusinessSelect] =
    useState(false);
  const [desktopShowInvestorSelect, setDesktopShowInvestorSelect] =
    useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useMobileBackNavigation(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      const initialBusiness = state.businesses.find(b => b.id === initialBusinessId);
      const isTrigger = initialBusiness?.investmentType === 'trigger';
      const minQty = initialBusiness?.triggerMinQuantity || 1;
      const defaultAmount = isTrigger && initialBusiness?.triggerAmount 
        ? new Intl.NumberFormat('en-IN').format(getCurrentMarketPrice(initialBusiness, state.investments) * minQty) 
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
    }
  }, [isOpen, initialBusinessId, initialInvestorId]);

  const selectedBusiness = state.businesses.find(
    (b) => b.id === formData.businessId,
  );

  const selectedInvestors = state.investors.filter(
    (i) => formData.investorIds.includes(i.id),
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

  const getTime = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
  const activeBusinesses = [...state.businesses].sort(
    (a, b) => getTime(b.id) - getTime(a.id),
  );
  const sortedInvestors = [...state.investors].sort(
    (a, b) =>
      new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime(),
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-bg"
          initial={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
          animate={isMobile ? { x: 0 } : { opacity: 1, scale: 1 }}
          exit={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
          transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
          className="hidden md:flex fixed inset-0 z-[200] bg-white dark:bg-[#111111] md:!bg-black/50 dark:md:!bg-black/60 items-center justify-center p-0 md:p-4 font-sans flex-col"
        >
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
                  <button onClick={onClose} className="p-1 -ml-2 text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setOrderMode("BUY");
                      setFormData({ ...formData, investorIds: [] });
                    }}
                    className={`px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "BUY" ? "bg-[#4184F3] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"}`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => {
                      setOrderMode("SELL");
                      setFormData({ ...formData, investorIds: [] });
                    }}
                    className={`px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors ${orderMode === "SELL" ? "bg-[#FF5722] text-white" : "text-gray-500 dark:text-[#8F8F8F] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"}`}
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
                          className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
                                value={businessSearch}
                                onChange={(e) =>
                                  setBusinessSearch(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
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
                                    const isTrigger = b.investmentType === 'trigger';
                                    const amount = isTrigger && b.triggerAmount 
                                      ? new Intl.NumberFormat('en-IN').format(getCurrentMarketPrice(b, state.investments)) 
                                      : "";
                                      
                                    setFormData({
                                      ...formData,
                                      businessId: b.id,
                                      amount: amount,
                                    });
                                    const liveRoi = marketState.trends[b.id];
                                    setExpectedRoi(liveRoi !== undefined ? liveRoi.toFixed(2) : "12");
                                    setDesktopShowBusinessSelect(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between"
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
                            ? selectedInvestors[0].name.toUpperCase()
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
                          className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] shadow-lg z-[60] flex flex-col overflow-hidden max-h-[250px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0 flex flex-col gap-2">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 dark:text-[#8F8F8F]" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search by name or ID..."
                                className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3]"
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
                                  const filteredIds = sortedInvestors.filter((i) => {
                                    if (
                                      !i.name.toLowerCase().includes(investorSearch.toLowerCase()) &&
                                      !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
                                    )
                                      return false;
                                    if (!isMobile && orderMode === "SELL" && selectedBusiness) {
                                      const hasActive = state.investments.some(
                                        (inv: any) =>
                                          inv.investorId === i.id &&
                                          inv.businessId === selectedBusiness.id &&
                                          inv.status === "active",
                                      );
                                      if (!hasActive) return false;
                                    }
                                    return true;
                                  }).map(i => i.id);

                                  if (filteredIds.every(id => formData.investorIds.includes(id)) && filteredIds.length > 0) {
                                    setFormData({ ...formData, investorIds: formData.investorIds.filter(id => !filteredIds.includes(id)) });
                                  } else {
                                    const newSet = new Set([...formData.investorIds, ...filteredIds]);
                                    setFormData({ ...formData, investorIds: Array.from(newSet) });
                                  }
                                }}
                                className="text-[12px] text-[#4184F3] hover:underline font-medium"
                              >
                                Select All
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            {sortedInvestors
                              .filter((i) => {
                                if (
                                  !i.name.toLowerCase().includes(investorSearch.toLowerCase()) &&
                                  !i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
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
                                      inv.businessId === selectedBusiness.id &&
                                      inv.status === "active",
                                  );
                                  if (!hasActive) return false;
                                }
                                return true;
                              })
                              .map((i) => {
                                const activeCount = selectedBusiness
                                  ? state.investments.filter(
                                      (inv: any) =>
                                        inv.investorId === i.id &&
                                        inv.businessId ===
                                          selectedBusiness.id &&
                                        inv.status === "active",
                                    ).length
                                  : 0;
                                return (
                                  <button
                                    key={i.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormData({ ...formData, investorIds: [i.id] });
                                      setDesktopShowInvestorSelect(false);
                                      setInvestorSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors flex items-center justify-between ${formData.investorIds.includes(i.id) ? "bg-blue-50/50 dark:bg-[#4184F3]/10 text-[#4184F3]" : "text-gray-900 dark:text-[#E3E3E3]"}`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                      {i.photoUrl ? (
                                        <img src={i.photoUrl} alt={i.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#4184F3]/20 flex items-center justify-center text-[#4184F3] text-[10px] font-bold shrink-0">
                                          {i.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="truncate">{i.name.toUpperCase()}</span>
                                                                            {activeCount > 0 && (
                                        <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px] shrink-0">
                                          {activeCount}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center shrink-0 ml-2">
                                      {formData.investorIds.includes(i.id) && (
                                        <CheckCircle className="w-4 h-4 text-[#4184F3]" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            {sortedInvestors.filter((i) =>
                                i.name.toLowerCase().includes(investorSearch.toLowerCase()) ||
                                i.investorId?.toLowerCase().includes(investorSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="px-3 py-4 text-center text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                                No investors found
                              </div>
                            )}
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
                    {selectedBusiness?.investmentType === 'trigger' && isMobile 
                      ? (inputMode === 'AMOUNT' ? 'Amount' : 'Quantity') 
                      : 'Amount'}
                  </label>
                  {selectedBusiness?.investmentType === 'trigger' && isMobile ? (
                    <div className="flex items-center bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] overflow-hidden focus-within:border-[#4184F3] transition-colors w-full">
                      <input
                        type="text"
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
                            let qty = numericValue;
                            if (raw === "") qty = "" as any;
                            let calculatedAmount = formData.amount;
                            if (selectedBusiness.triggerAmount && raw !== "") {
                               calculatedAmount = (qty * getCurrentMarketPrice(selectedBusiness, state.investments)).toLocaleString("en-IN");
                            }
                            setFormData({ ...formData, quantity: qty, amount: raw === "" ? "" : calculatedAmount });
                          }
                        }}
                        className="flex-1 px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none bg-transparent w-full min-w-0"
                      />
                      <div className="flex items-center gap-2 pr-3 shrink-0">
                        <span className="text-[12px] text-gray-400 dark:text-[#8F8F8F]">
                          {inputMode === 'AMOUNT' ? `${formData.quantity || 0} Qty` : `₹${formData.amount || 0}`}
                        </span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setInputMode(inputMode === 'AMOUNT' ? 'QTY' : 'AMOUNT');
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded text-[#4184F3]"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.amount ? `₹${formData.amount}` : ""}
                      onChange={handleAmountChange}
                      disabled={selectedBusiness?.investmentType === 'trigger'}
                      className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${selectedBusiness?.investmentType === 'trigger' ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]' : ''}`}
                    />
                  )}
                </div>
                {selectedBusiness?.investmentType === 'trigger' && (
                  <div className={`${isMobile ? 'hidden' : 'flex-1 space-y-1.5'}`}>
                    <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                      Quantity
                    </label>
                    <motion.input
                      type="number"
                      animate={shakeQuantity ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
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
                      className="w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F]">
                    Duration (Months)
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
                    Expected ROI (%)
                  </label>
                  <input
                    type="number"
                    value={expectedRoi}
                    onChange={(e) => setExpectedRoi(e.target.value)}
                    className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F] flex justify-between">
                    <span>Business Brokerage (%)</span>
                    {formData.amount && formData.adminCommissionBusinessPct && getRawAmount(formData.amount) > 0 && !isNaN(parseFloat(formData.adminCommissionBusinessPct)) && (
                      <span className="text-[#4184F3] font-medium">
                        {formatINR((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionBusinessPct)) / 100)}
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
                    disabled={orderMode === "SELL"}
                    className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-gray-500 dark:text-[#8F8F8F] flex justify-between">
                    <span>Investor Brokerage (%)</span>
                    {formData.amount && formData.adminCommissionInvestorPct && getRawAmount(formData.amount) > 0 && !isNaN(parseFloat(formData.adminCommissionInvestorPct)) && (
                      <span className="text-[#4184F3] font-medium">
                        {formatINR((getRawAmount(formData.amount) * parseFloat(formData.adminCommissionInvestorPct)) / 100)}
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
                    disabled={orderMode === "SELL"}
                    className={`w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] px-3 py-2 text-[14px] text-gray-900 dark:text-[#E3E3E3] outline-none focus:border-[#4184F3] transition-colors ${orderMode === "SELL" ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#111111]" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Bottom CTA for Mobile */}
            <div className="px-4 md:px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-[#2A2A2A]/30 mt-auto shrink-0 bg-white dark:bg-[#111111]">
              <button
                onClick={onClose}
                className="hidden md:block w-full md:w-auto px-6 py-2 rounded-[4px] text-[14px] font-medium text-gray-700 dark:text-[#C4C4C4] border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isBooking || !selectedBusiness || selectedInvestors.length === 0}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
