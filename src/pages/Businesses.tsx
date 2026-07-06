import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../utils/AppContext";
import { formatINR } from "../utils/mockData";
import {
  Plus,
  Search,
  Building2,
  Banknote,
  Building,
  X,
  BadgeCheck,
  ChevronDown,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Business } from "../types";
import BusinessDetail from "../components/BusinessDetail";
import { INDIAN_BANKS } from "../utils/indianBanks";
import { getVerificationStats } from "../utils/blueTick";

// Removed local MarketTrendCell
import { MarketTrendCell } from "../components/MarketTrendCell";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";



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

export default function Businesses() {
  const { state, dispatch } = useAppContext();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<
    "list" | "add-step-1" | "add-step-2"
  >("list");
  const [ownerMode, setOwnerMode] = useState<"new" | "existing">("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  
  useMobileBackNavigation(!!selectedBusinessId, () => setSelectedBusinessId(null));
  useMobileBackNavigation(viewMode === "add-step-1", () => setViewMode("list"));
  useMobileBackNavigation(viewMode === "add-step-2", () => setViewMode("add-step-1"));
  useMobileBackNavigation(showOwnerSelect, () => setShowOwnerSelect(false));


  // Scroll preservation
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    mainRef.current = document.querySelector("main");
  }, []);
  useEffect(() => {
    // Use selectedBusinessId to check
    // if detail view is active
    const isList = viewMode === "list" && !selectedBusinessId;
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
  }, [viewMode, selectedBusinessId]);
  // Form State
  const [formData, setFormData] = useState({
    businessId: "",
    name: "",
    shortName: "",
    ownerName: "",
    authorityType: "Business Authorities" as any,
    rmasSubsidy: "4",
    fundingRequired: "",
    interestRate: "",
    bankName: INDIAN_BANKS[0],
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    registrationFee: "",
    commissionPercentage: "1",
    taxPercentage: "18",
  });
  const getTime = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
  const uniqueBusinesses = Array.from(
    new Map<string, Business>(state.businesses.map((b) => [b.id, b])).values(),
  );
  const filteredBusinesses = uniqueBusinesses
    .filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.businessId?.includes(searchTerm),
    )
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const statsMap = getVerificationStats(state.businesses, state.investments);
  const isBlueTick = (bizId: string) =>
    statsMap.get(bizId)?.isBlueTick ?? false;
  const isPreVerified = (bizId: string) =>
    statsMap.get(bizId)?.isPreVerified ?? false;
  const uniqueOwners = Array.from(
    new Set(state.businesses.map((b) => b.businessId)),
  ).map((id) => state.businesses.find((b) => b.businessId === id)!);
  const handleExistingOwnerChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedOwnerId = e.target.value;
    const ownerRecord = state.businesses.find(
      (b) => b.businessId === selectedOwnerId,
    );
    if (ownerRecord) {
      setFormData({
        ...formData,
        businessId: ownerRecord.businessId,
        ownerName: ownerRecord.ownerName,
        authorityType:
          ownerRecord.authorityType || ("Business Authorities" as any),
        rmasSubsidy: ownerRecord.rmasSubsidy?.toString() || "4",
        bankName: ownerRecord.bankDetails?.bankName || INDIAN_BANKS[0],
        accountNumber: ownerRecord.bankDetails?.accountNumber || "",
        ifscCode: ownerRecord.bankDetails?.ifscCode || "",
        accountHolderName: ownerRecord.bankDetails?.accountHolderName || "",
      });
    }
  };
  const calculateFees = () => {
    const funding = parseFloat(formData.fundingRequired) || 0;
    const commPct = parseFloat(formData.commissionPercentage) || 0;
    const taxPct = parseFloat(formData.taxPercentage) || 0;
    const commission = (funding * commPct) / 100;
    const tax = (commission * taxPct) / 100;
    return { commission, tax, total: commission + tax };
  };
  const generateBusinessId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const startAddBusiness = () => {
    setOwnerMode("new");
    let defaultRegFee = "";
    if (state.settings && state.settings.newBusinessRegistration) {
      if (state.settings.newBusinessRegistration.type === "amount") {
        defaultRegFee = String(state.settings.newBusinessRegistration.value);
      }
    }
    setFormData({
      ...formData,
      businessId: generateBusinessId(),
      name: "",
    shortName: "",
      ownerName: "",
      fundingRequired: "",
      interestRate: "",
      bankName: INDIAN_BANKS[0],
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      registrationFee: defaultRegFee,
    });
    setViewMode("add-step-1");
  };
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerMode === "existing" && !formData.businessId) {
      alert("Please select an existing owner.");
      return;
    }
    if (!formData.name.trim() || !formData.ownerName.trim()) return;
    setFormData({
      ...formData,
      accountHolderName: formData.ownerName.toUpperCase(),
      // auto fill all caps
    });
    setViewMode("add-step-2");
  };
  const handleVerifiedSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fees = calculateFees();
    const newBusiness: Business = {
      id: `b${Date.now()}`,
      businessId: formData.businessId,
      name: formData.name,
      shortName: formData.shortName ? formData.shortName.toUpperCase() : "",
      ownerName: formData.ownerName,
      authorityType: formData.authorityType,
      rmasSubsidy:
        formData.authorityType === "Government Authorities" ||
        formData.authorityType === "Trust Authorities"
          ? Number(formData.rmasSubsidy) || 4
          : 0,
      registrationDate: new Date().toISOString().split("T")[0],
      fundingRequired: parseFloat(formData.fundingRequired),
      interestRate: parseFloat(formData.interestRate),
      registrationCommissionPaid: fees.commission,
      taxPaid: fees.tax,
      status: "listed",
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        accountHolderName: formData.accountHolderName.toUpperCase(),
      },
      registrationFee: Number(formData.registrationFee) || 0,
    };
    dispatch({ type: "ADD_BUSINESS", payload: newBusiness });
    setViewMode("list");
  };
  if (selectedBusinessId) {
    const businessForDetail = state.businesses.find(
      (b) => b.id === selectedBusinessId,
    );
    return (
      <BusinessDetail
        businessId={selectedBusinessId}
        onBack={() => setSelectedBusinessId(null)}
        onDelete={() => {
          const id = selectedBusinessId;
          setSelectedBusinessId(null);
          setDeletingId(id);
          setTimeout(() => {
            dispatch({ type: "DELETE_BUSINESS", payload: id });
            setDeletingId(null);
          }, 600);
        }}
      />
    );
  }
  return (
    <div className="w-full space-y-6 print:m-0 print:p-0">
      {" "}
      <div className="print:hidden space-y-6">
        {" "}
        {viewMode === "list" && (
          <>
            {" "}
            {/* Header Section */}{" "}
            <div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4 z-10">
              {" "}
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                {" "}
                <div className="hidden md:block">
                  {" "}
                  <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                    My Businesses
                  </h2>{" "}
                </div>{" "}
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                  {" "}
                  <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                    {" "}
                    <button
                  onClick={startAddBusiness}
                  className="flex items-center space-x-1.5 py-2 text-kite-blue font-medium text-[13px] md:text-[14px] hover:text-blue-600 transition-colors shadow-none"
                >
                  {" "}
                  <Plus className="w-4 h-4" />{" "}
                  <span>Register Business</span>{" "}
                </button>{" "}
                  </div>{" "}
                  {/* Search Container (Bottom on mobile, right on desktop) */}{" "}
                  <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">
                  {" "}
                  <div
                    className={`flex items-center transition-all duration-300 w-full md:max-w-md ${isSearchExpanded ? "bg-white dark:bg-kite-surface md:dark:bg-[#161616] rounded-sm shadow-sm" : "bg-transparent"}`}
                  >
                    {" "}
                    {!isSearchExpanded && (
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="-ml-1.5 p-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
                      >
                        {" "}
                        <Search className="w-[18px] h-[18px] text-kite-blue" />{" "}
                      </button>
                    )}{" "}
                    {isSearchExpanded && (
                      <div className="flex items-center w-full min-h-[36px] px-1">
                        {" "}
                        <button
                          onClick={() => {
                            setIsSearchExpanded(false);
                            setSearchTerm("");
                          }}
                          className="p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full mr-1 transition-colors flex-shrink-0"
                        >
                          {" "}
                          <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />{" "}
                        </button>{" "}
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search Eg: Radhika Kite Trade"
                          className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />{" "}
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="p-1.5 text-kite-text-muted hover:text-kite-text transition-colors flex-shrink-0"
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
            </div>
            </div>{" "}
            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">
              <div className="overflow-hidden">
                {" "}
                {/* Unified Watchlist View */}{" "}
                <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">
                  {/* DESKTOP HEADER */}
                  <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border">
                    <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>
                    <div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>
                    <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>
                    <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted pl-5 border-l border-kite-vertical-divider">FUND</div>
                  </div>
                  {filteredBusinesses.map((business, idx) => {
                    const activeInvestments = state.investments.filter(inv => inv.businessId === business.id && inv.status === "active");
                    const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
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
                            {business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}
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
                            {formatINR(business.fundingRequired)}
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
                                {business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}
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
                                setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id);
                              }}
                              className={`ml-4 focus:outline-none flex-shrink-0 flex items-center justify-center p-0.5 rounded transition-all hover:bg-gray-100 dark:hover:bg-[#202020] ${expandedBusinessId === business.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              <ChevronDown className={`w-[17px] h-[17px] text-kite-text-light transition-transform duration-300 ${expandedBusinessId === business.id ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          <div className="w-[28%] text-left py-3 text-[13px] text-kite-text-light truncate pl-4 border-l border-kite-vertical-divider">
                            {business.ownerName}
                          </div>
                          <div className="w-[14%] text-left py-3 text-[12px] text-kite-text-light font-mono truncate pl-4 border-l border-kite-vertical-divider">
                            {business.businessId}
                          </div>
                          <div className="w-[14%] text-right py-3 text-[13px] text-kite-green pr-4 border-l border-kite-vertical-divider truncate">
                            {business.interestRate}%
                          </div>
                          <div className="w-[14%] text-right py-3 text-[13px] font-normal text-kite-text pl-5 border-l border-kite-vertical-divider truncate">
                            {`₹${formatLargeNumber(totalInvested)}`}
                          </div>
                        </div>
                      
                        {/* Expanded Section (Desktop Only) */}
                        <AnimatePresence>
                          {expandedBusinessId === business.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="hidden md:block overflow-hidden bg-[#FAFBFC] dark:bg-[#151515]"
                            >
                              <div className="px-4 py-3 flex flex-col">
                                <div className="grid grid-cols-12 gap-6">
                                  <div className="col-span-8 flex flex-col">
                                    <span className="text-kite-text-light text-[11px] font-normal">Details</span>
                                    <span className="text-kite-text text-[14px] font-medium mt-0.5 whitespace-pre-wrap">{business.description || "No description provided for this business owner."}</span>
                                  </div>
                                  <div className="col-span-4 flex flex-col border-l border-kite-vertical-divider pl-6">
                                    <span className="text-kite-text-light text-[11px] font-normal">Address</span>
                                    <span className="text-kite-text text-[14px] font-medium mt-0.5">{business.location || "Not specified"}</span>
                                  </div>
                                </div>
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
          </>
        )}{" "}
        {viewMode === "add-step-1" && (
          <div className="w-full max-w-xl mx-auto bg-transparent border-t md:border-t border-kite-border dark:border-kite-border p-4 md:p-8 mt-4 md:mt-0">
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
                onClick={() => setOwnerMode("existing")}
                className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-[14px] font-normal transition-all duration-200 rounded border ${ownerMode === "existing" ? "bg-kite-blue text-white border-kite-blue" : "bg-kite-bg text-kite-text-light dark:text-kite-text border-kite-border dark:border-kite-border hover:bg-gray-50 dark:hover:bg-kite-border-soft hover:brightness-105"}`}
              >
                Already Registered Owner
              </button>
            </div>{" "}
            <form onSubmit={handleNextStep} className="space-y-6">
              {" "}
              <AnimatePresence mode="wait">
                {" "}
                <motion.div
                  key={ownerMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {" "}
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
                              <span className="text-kite-text-muted dark:text-kite-text-light font-normal">
                                Select an owner...
                              </span>
                            )}{" "}
                          </span>{" "}
                          <ChevronDown className="w-4 h-4 text-kite-text-muted dark:text-kite-text-light" />{" "}
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
                                    <span className="text-[11px] md:text-[12px] text-kite-text-light dark:text-kite-text-light mt-0.5">
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
                        Owner ID Number{" "}
                        {ownerMode === "new" ? "(Auto-Generated)" : "(Linked)"}
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
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
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
                          setFormData({ ...formData, shortName: e.target.value })
                        }
                        placeholder="e.g. ACME"
                      />{" "}
                    </div>{" "}
                    {ownerMode === "new" && (
                      <div>
                        {" "}
                        <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                          Owner Name
                        </label>{" "}
                        <input
                          required
                          type="text"
                          className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                          value={formData.ownerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ownerName: e.target.value,
                            })
                          }
                          placeholder="e.g. John Doe"
                        />{" "}
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
                        <p className="text-[11px] md:text-[12px] text-kite-text-light dark:text-kite-text-light mt-1.5">
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
                                <p className="text-[11px] md:text-[12px] text-kite-text-light mt-0.5">
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
                </motion.div>{" "}
              </AnimatePresence>{" "}
              <div className="flex justify-between items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border">
                {" "}
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="font-medium text-kite-text-light hover:text-gray-700"
                >
                  Cancel
                </button>{" "}
                <button
                  type="submit"
                  className="font-medium flex items-center bg-kite-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {" "}
                  <span>Next Step</span>{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>
        )}{" "}
        {viewMode === "add-step-2" && (
          <div className="w-full max-w-xl mx-auto bg-transparent border-t md:border-t border-kite-border dark:border-kite-border p-4 md:p-8 mt-4 md:mt-0">
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
                  <select
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-muted dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue cursor-pointer"}`}
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    disabled={ownerMode === "existing"}
                  >
                    {INDIAN_BANKS.map((bank) => (
                      <option
                        key={bank}
                        value={bank}
                        className="bg-kite-surface text-kite-text dark:text-kite-text"
                      >
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                    Account Number
                  </label>
                  <input
                    required
                    type="text"
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-muted dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="e.g. 30291039482"
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
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-mono uppercase outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-muted dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. SBIN0001234"
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
                    className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal uppercase outline-none transition-colors ${ownerMode === "existing" ? "text-kite-text-muted dark:text-kite-text-light cursor-not-allowed" : "text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue"}`}
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountHolderName: e.target.value.toUpperCase(),
                      })
                    }
                    readOnly={ownerMode === "existing"}
                  />
                  {ownerMode === "existing" ? (
                    <p className="text-[11px] md:text-[12px] text-orange-600 mt-1.5 font-normal">
                      Bank details are locked because this owner is already
                      registered.
                    </p>
                  ) : (
                    <p className="text-[11px] md:text-[12px] text-kite-text-light dark:text-kite-text-light mt-1.5">
                      Auto-filled from Step 1. You can edit if bank account name
                      differs.
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-kite-border dark:border-kite-border pt-6 mt-2">
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
              <div className="flex justify-between items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border">
                <button
                  type="button"
                  onClick={() => setViewMode("add-step-1")}
                  className="font-medium text-kite-text hover:text-kite-blue transition-colors text-[13px] md:text-[14px]"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="font-medium bg-kite-blue text-white px-4 py-2 rounded text-[13px] md:text-[14px] hover:bg-opacity-90 transition-colors"
                >
                  ✓ Verify & Register
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
