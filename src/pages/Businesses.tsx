import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ArrowLeft,
  X,
  ChevronDown,
  BadgeCheck,
  Clock,
  CheckCircle2,
  User,
  Building,
  Trash2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../utils/AppContext";
import { Business, Investor, Investment } from "../types";
import { formatINR } from "../utils/mockData";
import { getCurrentMarketPrice } from "../utils/marketSimulator";
import {
  getVerificationStats,
  getBlueTickBusinessIds,
} from "../utils/blueTick";
import { INDIAN_BANKS } from "../utils/indianBanks";
import BusinessDetail from "../components/BusinessDetail";
import BioRenderer from "../components/BioRenderer";

const BlueVerifiedBadge = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Verified" className="inline-block ml-1 -mt-0.5">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.838 3.45-.038.225-.06.456-.06.69 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.333 1.828 2.25 3.337 2.25 1.51 0 2.816-.917 3.337-2.25.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.234-.022-.465-.06-.69 1.098-.704 1.838-1.99 1.838-3.45z" fill="#1DA1F2"/>
    <path d="M15.42 8.783L10.33 14.1l-2.45-2.45c-.322-.322-.843-.322-1.165 0-.322.32-.322.84 0 1.16l3.03 3.03c.16.16.37.24.58.24.21 0 .42-.08.58-.24l5.67-6.07c.32-.32.31-.84-.01-1.16-.32-.32-.84-.31-1.16.01z" fill="#FFFFFF"/>
  </svg>
);

export default function Businesses() {
  const { state, dispatch } = useAppContext();

  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  const [expandedBusinessId, setExpandedBusinessId] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerMode, setOwnerMode] = useState("new");
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [showInvestorSelect, setShowInvestorSelect] = useState(false);
  const [investorSearch, setInvestorSearch] = useState("");
  const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [showVerifySuccess, setShowVerifySuccess] = useState(false);

  // Scroll preservation
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      const isList = viewMode === "list" && !selectedBusinessId;
      if (isList) {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [viewMode, selectedBusinessId]);

  useLayoutEffect(() => {
    const isList = viewMode === "list" && !selectedBusinessId;
    if (isList) {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [viewMode, selectedBusinessId]);

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    ownerName: "",
    fundingRequired: "",
    interestRate: "",
    businessId: "",
    description: "",
    location: "",
    authorityType: "Business Authorities",
    rmasSubsidy: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    registrationFee: ""
  });

  const uniqueOwners = useMemo(() => {
    const ownersMap = new Map();
    state.businesses.forEach((b) => {
      if (b.ownerName && !ownersMap.has(b.ownerName)) {
        ownersMap.set(b.ownerName, b);
      }
    });
    return Array.from(ownersMap.values());
  }, [state.businesses]);

  const statsMap = useMemo(
    () => getVerificationStats(state.businesses, state.investments),
    [state.businesses, state.investments],
  );

  const formatLargeNumber = (num) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + " CR";
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + " L";
    }
    return num.toLocaleString("en-IN");
  };

  const isBlueTick = (id) => statsMap.get(id)?.isBlueTick ?? false;
  const isPreVerified = (id) => statsMap.get(id)?.isPreVerified ?? false;

  const filteredBusinesses = state.businesses.filter(
    (b) =>
      (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.ownerName &&
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const startAddBusiness = () => {
    setFormData({
      name: "",
      shortName: "",
      ownerName: "",
      fundingRequired: "",
      interestRate: "",
      businessId: generateBusinessId(),
      description: "",
      location: "",
      authorityType: "Business Authorities",
      rmasSubsidy: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      registrationFee: ""
    });
    setOwnerMode("new");
    setViewMode("add-step-1");
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNextLoading(true);
    setFormData(prev => ({ ...prev, accountHolderName: prev.ownerName.toUpperCase() }));
    setTimeout(() => {
      setIsNextLoading(false);
      setViewMode("add-step-2");
    }, 1000);
  };

  const handleVerifiedSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      const newBusiness: Business = {
        id: crypto.randomUUID(),
        businessId: formData.businessId || generateBusinessId(),
        name: formData.name,
        shortName: formData.shortName,
        ownerName: formData.ownerName,
        fundingRequired: Number(formData.fundingRequired.toString().replace(/\D/g, "")),
        interestRate: Number(formData.interestRate),
        authorityType: formData.authorityType as any,
        rmasSubsidy: Number(formData.rmasSubsidy) || 0,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName.toUpperCase(),
        },
        registrationFee: Number(formData.registrationFee.toString().replace(/\D/g, "")),
        status: "pending",
        registrationDate: new Date().toISOString(),
        registrationCommissionPaid: 0,
        taxPaid: 0
      };
      dispatch({ type: "ADD_BUSINESS", payload: newBusiness });
      setIsVerifying(false);
      setShowVerifySuccess(true);
      setTimeout(() => {
        setShowVerifySuccess(false);
        setViewMode("list");
      }, 2000);
    }, 1500);
  };

  const handleExistingOwnerChange = (val: any) => {
    const bizId = val.target.value;
    const existingBiz = state.businesses.find(b => b.businessId === bizId);
    if (existingBiz) {
      setFormData(prev => ({
        ...prev,
        businessId: existingBiz.businessId,
        ownerName: existingBiz.ownerName,
        bankName: existingBiz.bankDetails?.bankName || "",
        accountNumber: existingBiz.bankDetails?.accountNumber || "",
        ifscCode: existingBiz.bankDetails?.ifscCode || "",
        accountHolderName: existingBiz.bankDetails?.accountHolderName || existingBiz.ownerName,
      }));
    }
  };
  const generateBusinessId = () => Math.floor(100000 + Math.random() * 900000).toString();

  return (
    <div className="w-full space-y-6 print:m-0 print:p-0">
      <div className="print:hidden space-y-6">
        {selectedBusinessId ? (
          <BusinessDetail
            businessId={selectedBusinessId}
            onBack={() => setSelectedBusinessId(null)}
          />
        ) : viewMode === "list" && (
          <>
            <div className="w-full">
              <div className="sticky top-0 z-30 bg-white dark:bg-kite-bg w-full">
                {/* Header Section */}
                
                {/* MOBILE HEADER */}
                <div className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-kite-bg w-full md:hidden pt-3 px-4 pb-3">
                  <div className="bg-white dark:bg-kite-surface rounded-[4px] shadow-sm flex items-center px-3 py-2.5 mb-3 border border-gray-200 dark:border-kite-border">
                    <Search className="w-5 h-5 text-gray-400 dark:text-[#A3ACB8]" />
                    <input 
                      type="text"
                      placeholder="Search & add"
                      className="flex-1 bg-transparent border-none outline-none ml-2 text-[15px] text-gray-900 dark:text-[#F1F5F9] placeholder-gray-400 dark:placeholder-[#A3ACB8]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center text-gray-400 dark:text-[#A3ACB8] text-[14px]">
                      <span className="mr-3">{state.businesses.length}/250</span>
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={startAddBusiness} className="flex items-center space-x-1.5 text-[#4184F3] font-medium text-[15px]">
                      <Plus className="w-[18px] h-[18px]" />
                      <span>Reg Company</span>
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex px-4 pt-4 pb-4 flex-row justify-between items-center relative mb-0 bg-white dark:bg-kite-bg">
                  <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                    <div className="hidden md:block">
                      <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                        My Businesses
                      </h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                      <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                        <button
                          onClick={startAddBusiness}
                          className="flex items-center space-x-1.5 py-2 text-kite-blue font-medium text-[13px] md:text-[14px] hover:text-blue-600 transition-colors shadow-none"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Register Business</span>
                        </button>
                      </div>
                      {/* Search Container */}
                      <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">
                        <div
                          className={`flex items-center transition-all duration-300 w-full md:max-w-md ${isSearchExpanded ? "bg-white dark:bg-kite-surface md:dark:bg-[#161616] rounded-sm shadow-sm" : "bg-transparent"}`}
                        >
                          {!isSearchExpanded && (
                            <button
                              onClick={() => setIsSearchExpanded(true)}
                              className="-ml-1.5 p-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
                            >
                              <Search className="w-[18px] h-[18px] text-kite-blue" />
                            </button>
                          )}
                          {isSearchExpanded && (
                            <div className="flex items-center w-full min-h-[36px] px-1">
                              <button
                                onClick={() => {
                                  setIsSearchExpanded(false);
                                  setSearchTerm("");
                                }}
                                className="p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full mr-1 transition-colors flex-shrink-0"
                              >
                                <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
                              </button>
                              <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Eg: Radhika Kite Trade"
                                className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              {searchTerm && (
                                <button
                                  onClick={() => setSearchTerm("")}
                                  className="p-1.5 text-kite-text-light hover:text-kite-text transition-colors flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex items-center px-4 bg-white dark:bg-[#1a1a1a] border-b border-kite-border w-full">
                  <div className="w-[30%] text-left py-2 text-[12px] text-kite-text">
                    BUSINESS NAME
                  </div>
                  <div className="w-[28%] text-left py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pl-4">
                    OWNER NAME
                  </div>
                  <div className="w-[14%] text-left py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pl-4">
                    ID
                  </div>
                  <div className="w-[14%] text-right py-2 text-[12px] text-kite-text border-l border-kite-vertical-divider pr-4">
                    ROI
                  </div>
                  <div className="w-[14%] text-right py-2 text-[12px] text-kite-text pl-5 border-l border-kite-vertical-divider">
                    TRIGGER
                  </div>
                </div>
              </div>
              <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">
                <div className="md:overflow-visible overflow-hidden">
                  {" "}
                  {/* Unified Watchlist View */}{" "}
                  <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">
                    {filteredBusinesses.map((business, idx) => {
                      const activeInvestments = state.investments.filter(
                        (inv) =>
                          inv.businessId === business.id &&
                          inv.status === "active",
                      );
                      const totalInvested = activeInvestments.reduce(
                        (sum, inv) => sum + inv.amount,
                        0,
                      );
                      return (
                        <div
                          key={`inv_${business.id}_${idx}`}
                          onClick={() => setSelectedBusinessId(business.id)}
                          className="flex flex-col bg-white dark:bg-kite-bg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors min-h-[50px] group"
                        >
                          {/* Mobile View */}
                          <div className="flex md:hidden items-center justify-between p-3 border-b border-kite-border">
                            {" "}
                            <div className="flex flex-col flex-1">
                              {" "}
                              <span className="text-[10px] md:text-[11px] ] text-kite-text-light mb-0.5 leading-tight">
                                {business.ownerName}
                              </span>{" "}
                              <div className="flex items-center space-x-1.5 mb-1">
                                {" "}
                                <span className="font-normal text-kite-text text-[13px] md:text-[14px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide">
                                  {business.shortName
                                    ? business.shortName.toUpperCase()
                                    : business.name?.toUpperCase()}
                                </span>{" "}
                                {isBlueTick(business.id) && (
                                  <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0" />
                                )}{" "}
                                {isPreVerified(business.id) && (
                                  <Clock className="w-3 h-3 text-kite-text flex-shrink-0" />
                                )}{" "}
                              </div>{" "}
                              <span className="font-sans text-[10px] md:text-[11px] ] text-kite-text-light leading-tight">
                                {business.businessId}
                              </span>{" "}
                            </div>{" "}
                            <div className="flex items-center space-x-3 md:space-x-6 text-right">
                              {" "}
                              <div className="flex flex-col items-end">
                                {" "}
                                <span className="font-normal text-kite-text text-[13px] md:text-[14px]">
                                  {business.triggerAmount ? formatINR(getCurrentMarketPrice(business, state.investments)) : '-'}
                                </span>{" "}
                                <span className="text-[11px] md:text-[12px] font-normal mt-0.5 text-kite-green">
                                  {" "}
                                  {business.interestRate}% ROI{" "}
                                </span>{" "}
                              </div>{" "}
                            </div>{" "}
                          </div>
                          {/* Desktop View */}
                          <div className="hidden md:flex items-center w-full px-4 border-b border-kite-border">
                            <div className="w-[30%] text-left py-3 flex items-center justify-between overflow-hidden pr-4">
                              <div className="flex items-center overflow-hidden flex-1">
                                <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                                  {business.shortName
                                    ? business.shortName.toUpperCase()
                                    : business.name?.toUpperCase()}
                                </span>
                                {isBlueTick(business.id) && (
                                  <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0 ml-1.5" />
                                )}
                                {isPreVerified(business.id) && (
                                  <Clock className="w-3 h-3 text-kite-text flex-shrink-0 ml-1.5" />
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedBusinessId(
                                    expandedBusinessId === business.id
                                      ? null
                                      : business.id,
                                  );
                                }}
                                className={`ml-4 focus:outline-none flex-shrink-0 flex items-center justify-center p-0.5 rounded transition-all hover:bg-gray-100 dark:hover:bg-[#202020] ${expandedBusinessId === business.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                              >
                                <ChevronDown
                                  className={`w-[17px] h-[17px] text-kite-text-light transition-transform duration-300 ${expandedBusinessId === business.id ? "rotate-180" : ""}`}
                                />
                              </button>
                            </div>
                            <div className="w-[28%] text-left py-3 text-[13px] text-kite-text-light truncate pl-4 border-l border-kite-vertical-divider">
                              {business.ownerName}
                            </div>
                            <div className="w-[14%] text-left py-3 text-[12px] text-kite-text font-mono truncate pl-4 border-l border-kite-vertical-divider">
                              {business.businessId}
                            </div>
                            <div className="w-[14%] text-right py-3 text-[13px] text-kite-green pr-4 border-l border-kite-vertical-divider truncate">
                              {business.interestRate}%
                            </div>
                            <div className="w-[14%] text-right py-3 text-[13px] font-normal text-kite-text pl-5 border-l border-kite-vertical-divider truncate">
                              {business.triggerAmount ? formatINR(getCurrentMarketPrice(business, state.investments)) : '-'}
                            </div>
                          </div>

                          {/* Expanded Section (Desktop Only) */}
                          <AnimatePresence>
                            {expandedBusinessId === business.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.25,
                                  ease: "easeInOut",
                                }}
                                className="hidden md:block overflow-hidden bg-[#FAFBFC] dark:bg-[#151515]"
                              >
                                <div className="px-4 py-4">
                                  {business.companyInfo ? (
                                    <div className="space-y-4">
                                      {business.companyInfo.companyName && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Name</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.companyName}</p>
                                        </div>
                                      )}
                                      {business.companyInfo.ownerName && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Owner Name</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.ownerName}</p>
                                        </div>
                                      )}
                                      {business.companyInfo.since && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Since</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text">{business.companyInfo.since}</p>
                                        </div>
                                      )}
                                      {business.companyInfo.documents && business.companyInfo.documents.length > 0 && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Documents</h3>
                                          <ul className="space-y-1">
                                            {business.companyInfo.documents.map((doc, idx) => (
                                              <li key={idx} className="text-[13px] md:text-[14px] text-kite-text flex items-center gap-1.5">
                                                {doc} <BlueVerifiedBadge />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {business.companyInfo.governmentRegIdentifies && business.companyInfo.governmentRegIdentifies.length > 0 && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Government Reg Identifies</h3>
                                          <ul className="space-y-1">
                                            {business.companyInfo.governmentRegIdentifies.map((id, idx) => (
                                              <li key={idx} className="text-[13px] md:text-[14px] text-kite-text flex items-center gap-1.5">
                                                {id} <BlueVerifiedBadge />
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {business.companyInfo.companyInformation && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Information</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyInformation} /></p>
                                        </div>
                                      )}
                                      {business.companyInfo.profitRevenueInvest && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Profit Revenue & Invest</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.profitRevenueInvest} /></p>
                                        </div>
                                      )}
                                      {business.companyInfo.investmentIdea && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Investments Idea</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.investmentIdea} /></p>
                                        </div>
                                      )}
                                      {business.companyInfo.companyShareHolder && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Share Holder</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyShareHolder} /></p>
                                        </div>
                                      )}
                                      {business.companyInfo.companyAddress && (
                                        <div>
                                          <h3 className="text-[10px] md:text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Company Address</h3>
                                          <p className="text-[13px] md:text-[14px] text-kite-text whitespace-pre-wrap leading-relaxed"><BioRenderer bio={business.companyInfo.companyAddress} /></p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-12 gap-6">
                                      <div className="col-span-8 flex flex-col">
                                        <span className="text-kite-text-light text-[11px] font-normal">
                                          Details
                                        </span>
                                        <span className="text-kite-text text-[14px] font-medium mt-0.5 whitespace-pre-wrap">
                                          {business.description ||
                                            "No description provided for this business owner."}
                                        </span>
                                      </div>
                                      <div className="col-span-4 flex flex-col border-l border-kite-vertical-divider pl-6">
                                        <span className="text-kite-text-light text-[11px] font-normal">
                                          Address
                                        </span>
                                        <span className="text-kite-text text-[14px] font-medium mt-0.5">
                                          {business.location || "Not specified"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}{" "}
                    {filteredBusinesses.length === 0 && (
                      <div className="p-8 text-center text-kite-text-light font-normal text-[13px] md:text-[14px]">
                        No businesses found.
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          </>
        )}{" "}
        {viewMode === "add-step-1" && (
          <div className="w-full max-w-xl md:max-w-full mx-auto md:mx-0 bg-transparent border-t md:border-t border-kite-border dark:border-kite-border p-4 md:p-8 mt-4 md:mt-0">
            {" "}
            <div className="flex flex-col md:flex-row gap-3 mb-6 md:mb-8 border-b border-kite-border dark:border-kite-border pb-4">
              <button
                type="button"
                onClick={() => {
                  setOwnerMode("new");
                  setFormData({
                    ...formData,
                    businessId: generateBusinessId(),
                    ownerName: "",
                  });
                }}
                className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-[14px] font-normal transition-all duration-200 rounded border ${ownerMode === "new" ? "bg-kite-blue text-white border-kite-blue" : "bg-kite-bg text-kite-text-light dark:text-kite-text border-kite-border dark:border-kite-border hover:bg-gray-50 dark:hover:bg-kite-border-soft hover:brightness-105"}`}
              >
                New Business Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnerMode("existing");
                  setFormData(prev => ({
                    ...prev,
                    businessId: "",
                    ownerName: "",
                    bankName: "",
                    accountNumber: "",
                    ifscCode: "",
                    accountHolderName: "",
                  }));
                }}
                className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-[14px] font-normal transition-all duration-200 rounded border ${ownerMode === "existing" ? "bg-kite-blue text-white border-kite-blue" : "bg-kite-bg text-kite-text-light dark:text-kite-text border-kite-border dark:border-kite-border hover:bg-gray-50 dark:hover:bg-kite-border-soft hover:brightness-105"}`}
              >
                Already Registered Owner
              </button>
            </div>{" "}
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2 md:gap-4">
                    {" "}
                    {ownerMode === "existing" && (
                      <div className="relative z-20">
                        {" "}
                        <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                          Select Existing Owner
                        </label>{" "}
                        <div
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border py-2 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-kite-blue"
                          onClick={() => {
                            setShowOwnerSelect(!showOwnerSelect);
                            setOwnerSearch("");
                          }}
                        >
                          {" "}
                          <span className="truncate text-[13px] md:text-[14px]">
                            {" "}
                            {formData.businessId ? (
                              <span className="font-normal text-kite-text dark:text-kite-text">
                                {formData.ownerName}{" "}
                                <span className="font-normal text-kite-text-light dark:text-[#7A7A7A] ml-1 font-mono text-[11px] md:text-[12px]">
                                  (ID: #{formData.businessId})
                                </span>
                              </span>
                            ) : (
                              <span className="text-kite-text-light dark:text-kite-text-light font-normal">
                                Select an owner...
                              </span>
                            )}{" "}
                          </span>{" "}
                          <ChevronDown className="w-4 h-4 text-kite-text-light dark:text-kite-text-light" />{" "}
                        </div>{" "}
                        {showOwnerSelect && (
                          <div className="absolute z-10 w-full mt-1 bg-kite-surface border border-kite-border dark:border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col">
                            {" "}
                            <div className="p-2 border-b border-kite-border dark:border-kite-border bg-kite-bg dark:bg-kite-bg">
                              {" "}
                              <div className="relative">
                                {" "}
                                <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light dark:text-kite-text-light" />{" "}
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search owner..."
                                  className="w-full pl-8 pr-3 py-1.5 text-[13px] md:text-[14px] border border-kite-border dark:border-kite-border bg-transparent text-kite-text dark:text-kite-text rounded-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                  value={ownerSearch}
                                  onChange={(e) =>
                                    setOwnerSearch(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />{" "}
                              </div>{" "}
                            </div>{" "}
                            <div className="overflow-y-auto flex-1">
                              {" "}
                              {uniqueOwners
                                .filter(
                                  (b) =>
                                    b.ownerName
                                      .toLowerCase()
                                      .includes(ownerSearch.toLowerCase()) ||
                                    b.businessId
                                      .toLowerCase()
                                      .includes(ownerSearch.toLowerCase()),
                                )
                                .map((b) => (
                                  <div
                                    key={`opt_${b.id}`}
                                    className="px-4 py-3 hover:bg-kite-bg dark:hover:bg-kite-border-soft cursor-pointer flex flex-col border-b border-kite-border dark:border-kite-border last:border-0 transition-colors"
                                    onClick={() => {
                                      handleExistingOwnerChange({
                                        target: { value: b.businessId },
                                      } as any);
                                      setShowOwnerSelect(false);
                                    }}
                                  >
                                    {" "}
                                    <span className="font-normal text-kite-text dark:text-kite-text">
                                      {b.ownerName}
                                    </span>{" "}
                                    <span className="text-[11px] md:text-[12px] text-kite-text dark:text-kite-text-light mt-0.5">
                                      ID: #{b.businessId}
                                    </span>{" "}
                                  </div>
                                ))}{" "}
                              {uniqueOwners.filter(
                                (b) =>
                                  b.ownerName
                                    .toLowerCase()
                                    .includes(ownerSearch.toLowerCase()) ||
                                  b.businessId
                                    .toLowerCase()
                                    .includes(ownerSearch.toLowerCase()),
                              ).length === 0 && (
                                <div className="px-4 py-3 text-[13px] md:text-[14px] text-kite-text-light dark:text-kite-text-light text-center">
                                  No owner found.
                                </div>
                              )}{" "}
                            </div>{" "}
                          </div>
                        )}{" "}
                      </div>
                    )}{" "}
                    <div>
                      {" "}
                      <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                        OWNER ID NUMBER
                      </label>{" "}
                      <input
                        type="text"
                        readOnly
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono text-kite-text-light dark:text-kite-text-light cursor-not-allowed outline-none"
                        value={formData.businessId}
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                        Business Name
                      </label>{" "}
                      <input
                        required
                        type="text"
                        autoFocus
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value.toUpperCase() })
                        }
                        placeholder="Example : Encore Health Private Limited"
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                        Short Business Name
                      </label>{" "}
                      <input
                        type="text"
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"
                        value={formData.shortName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shortName: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Example : ENCOREHPL"
                      />{" "}
                    </div>{" "}
                    {ownerMode === "new" && (
                      <div className="relative z-10">
                        {" "}
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] md:text-[12px] font-medium text-kite-text dark:text-kite-text uppercase tracking-wider">
                            Owner Name
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowInvestorSelect(!showInvestorSelect);
                              setInvestorSearch("");
                            }}
                            className="text-[11px] md:text-[12px] font-medium text-kite-blue hover:underline focus:outline-none"
                          >
                            investor register
                          </button>
                        </div>
                        <input
                          required
                          type="text"
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"
                          value={formData.ownerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ownerName: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="Example : Radhika Marchant"
                        />{" "}
                        {showInvestorSelect && (
                          <div className="absolute z-20 w-full mt-1 bg-kite-surface border border-kite-border dark:border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                            <div className="p-2 border-b border-kite-border dark:border-kite-border bg-kite-bg dark:bg-kite-bg">
                              <div className="relative">
                                <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light dark:text-kite-text-light" />
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search investor..."
                                  className="w-full pl-8 pr-3 py-1.5 text-[13px] md:text-[14px] border border-kite-border dark:border-kite-border bg-transparent text-kite-text dark:text-kite-text rounded-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                  value={investorSearch}
                                  onChange={(e) => setInvestorSearch(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto flex-1">
                              {state.investors
                                .filter((inv) => inv.name.toLowerCase().includes(investorSearch.toLowerCase()) || inv.investorId?.toLowerCase().includes(investorSearch.toLowerCase()))
                                .sort((a, b) => {
                                  const idA = parseInt(a.investorId?.replace(/\D/g, "") || "0");
                                  const idB = parseInt(b.investorId?.replace(/\D/g, "") || "0");
                                  return idB - idA;
                                })
                                .map((inv) => (
                                  <div
                                    key={inv.id}
                                    className="px-4 py-3 hover:bg-kite-bg dark:hover:bg-kite-border-soft cursor-pointer flex flex-row items-center border-b border-kite-border dark:border-kite-border last:border-0 transition-colors gap-3"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        ownerName: inv.name,
                                        bankName: inv.bankDetails?.bankName || "",
                                        accountNumber: inv.bankDetails?.accountNumber || "",
                                        ifscCode: inv.bankDetails?.ifscCode || "",
                                        accountHolderName: inv.bankDetails?.accountHolderName || inv.name,
                                      }));
                                      setShowInvestorSelect(false);
                                    }}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#E8F0FE] dark:bg-kite-blue/10 text-kite-blue dark:text-kite-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
                                      {inv.photoUrl ? (
                                        <img src={inv.photoUrl} alt={inv.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[11px] font-normal">
                                          {(() => {
                                            const n = (inv.name) || "";
                                            const parts = n.trim().split(" ");
                                            if (parts.length > 1 && parts[1].length > 0) {
                                              return (parts[0][0] + parts[1][0]).toUpperCase();
                                            }
                                            return n.substring(0, 2).toUpperCase();
                                          })()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-normal text-kite-text dark:text-kite-text text-[13px] md:text-[14px] uppercase">{inv.name}</span>
                                      <span className="text-[11px] md:text-[12px] text-kite-text dark:text-kite-text-light font-mono mt-0.5">
                                        ID: #{inv.investorId}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              {state.investors.filter((inv) => inv.name.toLowerCase().includes(investorSearch.toLowerCase()) || inv.investorId?.toLowerCase().includes(investorSearch.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-[13px] md:text-[14px] text-kite-text-light dark:text-kite-text-light text-center">
                                  No investor found.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}{" "}
                    <div>
                      {" "}
                      <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                        Authority Type
                      </label>{" "}
                      <select
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors outline-none cursor-pointer"
                        value={formData.authorityType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorityType: e.target.value as any,
                          })
                        }
                        required
                      >
                        {" "}
                        <option value="Business Authorities">
                          Business Authorities
                        </option>{" "}
                        <option value="Government Authorities">
                          Government Authorities
                        </option>{" "}
                        <option value="Trust Authorities">
                          Trust Authorities
                        </option>{" "}
                      </select>{" "}
                    </div>{" "}
                    {(formData.authorityType === "Government Authorities" ||
                      formData.authorityType === "Trust Authorities") && (
                      <div>
                        {" "}
                        <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                          RMAS Subsidy Rate (%)
                        </label>{" "}
                        <input
                          required
                          type="number"
                          step="0.1"
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                          value={formData.rmasSubsidy}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rmasSubsidy: e.target.value,
                            })
                          }
                          placeholder="e.g. 4"
                        />{" "}
                        <p className="text-[11px] md:text-[12px] text-kite-text dark:text-kite-text-light mt-1.5">
                          RMAS will pay this percentage towards the interest
                          when an investor withdraws.
                        </p>{" "}
                      </div>
                    )}{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {" "}
                      <div>
                        {" "}
                        <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                          Funding Required (₹)
                        </label>{" "}
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                          value={
                            formData.fundingRequired
                              ? Number(
                                  formData.fundingRequired
                                    .toString()
                                    .replace(/\D/g, ""),
                                ).toLocaleString("en-IN")
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fundingRequired: e.target.value.replace(
                                /\D/g,
                                "",
                              ),
                            })
                          }
                          placeholder="e.g. 5,00,000"
                        />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                          Interest Rate (%)
                        </label>{" "}
                        <input
                          required
                          type="number"
                          step="0.1"
                          min="0"
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                          value={formData.interestRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              interestRate: e.target.value,
                            })
                          }
                          placeholder="e.g. 12.5"
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    {Number(formData.fundingRequired) > 0 &&
                      Number(formData.interestRate) > 0 && (
                        <div className="mt-4 border border-kite-border rounded-sm overflow-hidden">
                          {" "}
                          <button
                            type="button"
                            onClick={() =>
                              setShowInterestCalculation(
                                !showInterestCalculation,
                              )
                            }
                            className="w-full flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-kite-text transition-colors font-medium text-[13px] md:text-[14px]"
                          >
                            {" "}
                            <span className="truncate">
                              Show Interest Return Breakdown
                            </span>{" "}
                            <span className="text-kite-text-light text-[11px] md:text-[12px] flex-shrink-0">
                              {showInterestCalculation ? "−" : "+"}
                            </span>{" "}
                          </button>{" "}
                          {showInterestCalculation && (
                            <div className="p-2 md:p-4 bg-white dark:bg-kite-surface border-t border-kite-border flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                              {" "}
                              <div>
                                {" "}
                                <p className="text-[13px] md:text-[14px] font-normal text-kite-text">
                                  Calculated Return to Investor
                                </p>{" "}
                                <p className="text-[11px] md:text-[12px] text-kite-text mt-0.5">
                                  Based on{" "}
                                  <span className="font-normal text-kite-green">
                                    {formData.interestRate}%
                                  </span>{" "}
                                  interest rate applied on{" "}
                                  <span className="font-mono font-normal">
                                    {formatINR(
                                      Number(formData.fundingRequired),
                                    )}
                                  </span>
                                  .
                                </p>{" "}
                              </div>{" "}
                              <div className="text-left flex flex-col gap-2 min-w-0">
                                {" "}
                                <p className="text-[13px] md:text-[14px] font-normal text-kite-text-light dark:text-kite-text-light border border-kite-border dark:border-kite-border bg-kite-bg dark:bg-kite-bg px-3 py-1.5 rounded-sm break-words whitespace-normal">
                                  {" "}
                                  Monthly Return:{" "}
                                  <span className="font-normal font-mono text-kite-text dark:text-kite-text break-all">
                                    {formatINR(
                                      (Number(formData.fundingRequired) *
                                        Number(formData.interestRate)) /
                                        100 /
                                        12,
                                    )}
                                  </span>{" "}
                                </p>{" "}
                                <p className="text-[13px] md:text-[14px] font-normal text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-sm break-words whitespace-normal">
                                  {" "}
                                  Yearly Return:{" "}
                                  <span className="font-normal font-mono text-green-900 dark:text-green-300 break-all">
                                    {formatINR(
                                      (Number(formData.fundingRequired) *
                                        Number(formData.interestRate)) /
                                        100,
                                    )}
                                  </span>{" "}
                                </p>{" "}
                              </div>{" "}
                            </div>
                          )}{" "}
                        </div>
                      )}{" "}
                  </div>{" "}
              </div>{" "}
              <div className="flex flex-col items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border space-y-4">
                {" "}
                <button
                  type="submit"
                  disabled={isNextLoading}
                  className="w-full md:w-auto min-w-[200px] font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                >
                  {" "}
                  {isNextLoading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </span>
                  ) : (
                    <>
                      <span>Next Step</span>{" "}
                      <ArrowRight className="w-4 h-4 ml-2" />{" "}
                    </>
                  )}
                </button>{" "}
                <button
                  type="button"
                  disabled={isNextLoading}
                  onClick={() => setViewMode("list")}
                  className="w-full md:w-auto min-w-[200px] font-medium text-kite-text hover:text-kite-blue py-2 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>
        )}{" "}
        {viewMode === "add-step-2" && (
          <div className="w-full max-w-xl md:max-w-full mx-auto md:mx-0 bg-transparent border-t md:border-t border-kite-border dark:border-kite-border p-4 md:p-8 mt-4 md:mt-0">
            <div className="flex items-center mb-6 md:mb-8 border-b border-kite-border dark:border-kite-border pb-4">
              <button
                type="button"
                onClick={() => setViewMode("add-step-1")}
                className="flex items-center text-kite-text hover:text-kite-blue transition-colors text-[13px] md:text-[14px] font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back to Details</span>
              </button>
            </div>
            <form onSubmit={handleVerifiedSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank Name</span>
                  </label>
                  <div className="relative z-20">
                    <div
                      className={`w-full border-0 border-b border-kite-border py-2 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-kite-blue ${ownerMode === "existing" ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => {
                        setShowBankSelect(!showBankSelect);
                        setBankSearch("");
                      }}
                    >
                      <span className="truncate text-[13px] md:text-[14px] text-kite-text">
                        {formData.bankName || "Select Bank"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-kite-text-light" />
                    </div>
                    {showBankSelect && (
                      <div className="absolute z-10 w-full mt-1 bg-kite-surface border border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col shadow-lg">
                        <div className="p-2 border-b border-kite-border bg-kite-bg">
                          <div className="relative">
                            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search bank..."
                              className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-kite-border bg-transparent text-kite-text rounded-sm focus:outline-none focus:ring-1 focus:ring-kite-blue"
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {INDIAN_BANKS.filter((b) =>
                            b.toLowerCase().includes(bankSearch.toLowerCase()),
                          ).map((bank) => (
                            <div
                              key={bank}
                              className="px-4 py-2 hover:bg-kite-bg cursor-pointer border-b border-kite-border last:border-0 text-[13px] text-kite-text"
                              onClick={() => {
                                setFormData({ ...formData, bankName: bank });
                                setShowBankSelect(false);
                              }}
                            >
                              {bank}
                            </div>
                          ))}
                          {INDIAN_BANKS.filter((b) =>
                            b.toLowerCase().includes(bankSearch.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-4 py-3 text-[13px] text-kite-text-light text-center">
                              No bank found.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                    Account Number
                  </label>
                  <input
                    required
                    type="text"
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-light dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                      const last4 = raw.length >= 4 ? raw.slice(-4) : raw;
                      const ifscPrefix = formData.ifscCode
                        .replace(/[^A-Z]/g, "")
                        .slice(0, 3);
                      const newIfsc =
                        ifscPrefix.length === 3
                          ? ifscPrefix + last4
                          : ifscPrefix;
                      setFormData({
                        ...formData,
                        accountNumber: formatted,
                        ifscCode: newIfsc,
                      });
                    }}
                    placeholder="e.g. 1234 5678 9012"
                    readOnly={ownerMode === "existing"}
                  />
                </div>
                <div>
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                    IFSC Code
                  </label>
                  <input
                    required
                    type="text"
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono uppercase outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-light dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.ifscCode}
                    onChange={(e) => {
                      const prefix = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .slice(0, 3);
                      const rawAcc = formData.accountNumber.replace(/\D/g, "");
                      const last4 =
                        rawAcc.length >= 4 ? rawAcc.slice(-4) : rawAcc;
                      setFormData({
                        ...formData,
                        ifscCode: prefix.length === 3 ? prefix + last4 : prefix,
                      });
                    }}
                    placeholder="e.g. HDF9012"
                    readOnly={ownerMode === "existing"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                    Account Holder Name
                  </label>
                  <input
                    required
                    type="text"
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal uppercase outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-light dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountHolderName: e.target.value.toUpperCase(),
                      })
                    }
                    readOnly={ownerMode === "existing"}
                  />
                  {ownerMode === "existing" && (
                    <p className="text-[11px] md:text-[12px] text-orange-600 mt-1.5 font-normal">
                      Bank details are locked because this owner is already
                      registered.
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2 mt-2">
                <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                  Registration Fee (₹)
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  className="w-full md:w-1/2 border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-blue focus:ring-0 focus:border-kite-blue outline-none transition-colors"
                  value={
                    formData.registrationFee
                      ? Number(
                          formData.registrationFee
                            .toString()
                            .replace(/\D/g, ""),
                        ).toLocaleString("en-IN")
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationFee: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="e.g. 10,000"
                />
              </div>
              <div className="flex flex-col items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border space-y-4">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full md:w-auto min-w-[200px] font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    "✓ Verify & Register"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => setViewMode("add-step-1")}
                  className="w-full md:w-auto min-w-[200px] font-medium text-kite-text hover:text-kite-blue py-2 transition-colors disabled:opacity-50"
                >
                  ← Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
