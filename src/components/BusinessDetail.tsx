import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { formatINR } from "../utils/mockData";
import {
  ArrowLeft,
  Upload,
  Search,
  ChevronRight,
  Info,
  Trash2,
  AlertTriangle,
  Pencil,
  CheckCircle2,
  Plus
} from "lucide-react";
import { Business } from "../types";
import { getVerificationStats } from "../utils/blueTick";
import {
  getUnifiedBankBalance,
  getUnifiedTransactions,
} from "../utils/bankBalance";
import ImageCropModal from "./ImageCropModal";

interface Props {
  businessId: string;
  onBack: () => void;
  onDelete?: () => void;
}


const formatCompactZerodha = (num: number) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum >= 10000000) {
    return (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
  }
  if (absNum >= 100000) {
    return (num / 100000).toFixed(2).replace(/\.00$/, '') + 'LK';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return num.toString();
};

const VerifiedBadge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified" className="inline-block ml-1 -mt-0.5">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.838 3.45-.038.225-.06.456-.06.69 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.333 1.828 2.25 3.337 2.25 1.51 0 2.816-.917 3.337-2.25.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.234-.022-.465-.06-.69 1.098-.704 1.838-1.99 1.838-3.45z" fill="currentColor" className="text-[#4CAF50] dark:text-[#5B9A5D]"/>
    <path d="M15.42 8.783L10.33 14.1l-2.45-2.45c-.322-.322-.843-.322-1.165 0-.322.32-.322.84 0 1.16l3.03 3.03c.16.16.37.24.58.24.21 0 .42-.08.58-.24l5.67-6.07c.32-.32.31-.84-.01-1.16-.32-.32-.84-.31-1.16.01z" fill="#FFFFFF"/>
  </svg>
);

const BlueVerifiedBadge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified" className="inline-block ml-1 -mt-0.5">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.838 3.45-.038.225-.06.456-.06.69 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.333 1.828 2.25 3.337 2.25 1.51 0 2.816-.917 3.337-2.25.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.234-.022-.465-.06-.69 1.098-.704 1.838-1.99 1.838-3.45z" fill="#1DA1F2"/>
    <path d="M15.42 8.783L10.33 14.1l-2.45-2.45c-.322-.322-.843-.322-1.165 0-.322.32-.322.84 0 1.16l3.03 3.03c.16.16.37.24.58.24.21 0 .42-.08.58-.24l5.67-6.07c.32-.32.31-.84-.01-1.16-.32-.32-.84-.31-1.16.01z" fill="#FFFFFF"/>
  </svg>
);

export default function BusinessDetail({
  businessId,
  onBack,
  onDelete,
}: Props) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  const marketTrends = marketState.trends;
  const business = state.businesses.find((b) => b.id === businessId);
  const [currentView, setCurrentView] = useState<"menu" | "funds" | "profile" | "investors" | "bank" | "registration" | "policy" | "trigger" | "trigger-history" | "trigger-suggestion" | "company-info">("menu");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSavingTrigger, setIsSavingTrigger] = useState(false);
  const [isSavingMarket, setIsSavingMarket] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editingFields, setEditingFields] = useState({
    name: false,
    ownerName: false,
    shortName: false
  });

  useMobileBackNavigation(currentView !== "menu", () => setCurrentView("menu"));

  
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [formData, setFormData] = useState({
    fundingRequired: business?.fundingRequired ? new Intl.NumberFormat('en-IN').format(business.fundingRequired) : "0",
    interestRate: business?.interestRate.toString() || "0",
    status: business?.status || "listed",
    name: business?.name || "",
    shortName: business?.shortName || "",
    description: business?.description || "",
    location: business?.location || "",
    photoUrl: business?.photoUrl || "",
    ownerName: business?.ownerName || "",
  });

  const [companyInfoData, setCompanyInfoData] = useState({
    companyName: business?.companyInfo?.companyName || "",
    ownerName: business?.companyInfo?.ownerName || "",
    since: business?.companyInfo?.since || "",
    documents: business?.companyInfo?.documents || [],
    governmentRegIdentifies: business?.companyInfo?.governmentRegIdentifies || [],
    companyInformation: business?.companyInfo?.companyInformation || "",
    profitRevenueInvest: business?.companyInfo?.profitRevenueInvest || "",
    investmentIdea: business?.companyInfo?.investmentIdea || "",
    companyShareHolder: business?.companyInfo?.companyShareHolder || "",
    companyAddress: business?.companyInfo?.companyAddress || "",
  });

  const [newDocument, setNewDocument] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");

  const [triggerConfig, setTriggerConfig] = useState({
    type: business?.investmentType || 'manual',
    amount: business?.triggerAmount ? new Intl.NumberFormat('en-IN').format(business.triggerAmount) : "",
    minQuantity: business?.triggerMinQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMinQuantity) : "",
    maxQuantity: business?.triggerMaxQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMaxQuantity) : "",
    increaseMarket: business?.increaseMarket?.toString() || "",
    downMarket: business?.downMarket?.toString() || "",
  });

  useEffect(() => {
    if (business) {
      setTriggerConfig({
        type: business.investmentType || 'manual',
        amount: business.triggerAmount ? new Intl.NumberFormat('en-IN').format(business.triggerAmount) : "",
        minQuantity: business.triggerMinQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMinQuantity) : "",
        maxQuantity: business.triggerMaxQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMaxQuantity) : "",
        increaseMarket: business.increaseMarket?.toString() || "",
        downMarket: business.downMarket?.toString() || "",
      });
      setFormData({
        fundingRequired: new Intl.NumberFormat('en-IN').format(business.fundingRequired || 0),
        interestRate: (business.interestRate || 0).toString(),
        status: business.status || "listed",
        name: business.name || "",
        shortName: business.shortName || "",
        description: business.description || "",
        location: business.location || "",
        photoUrl: business.photoUrl || "",
        ownerName: business.ownerName || "",
      });
      setCompanyInfoData({
        companyName: business.companyInfo?.companyName || "",
        ownerName: business.companyInfo?.ownerName || "",
        since: business.companyInfo?.since || "",
        documents: business.companyInfo?.documents || [],
        governmentRegIdentifies: business.companyInfo?.governmentRegIdentifies || [],
        companyInformation: business.companyInfo?.companyInformation || "",
        profitRevenueInvest: business.companyInfo?.profitRevenueInvest || "",
        investmentIdea: business.companyInfo?.investmentIdea || "",
        companyShareHolder: business.companyInfo?.companyShareHolder || "",
        companyAddress: business.companyInfo?.companyAddress || "",
      });
    }
  }, [business]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!business) return null;

  const getTime = (id: string) => parseInt(id.replace(/\D/g, "")) || 0;
  const businessInvestments = state.investments
    .filter((inv) => inv.businessId === businessId)
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const activeBusinessInvestments = businessInvestments.filter(
    (i) => i.status !== "completed",
  );
  
  const totalFunded = activeBusinessInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  const totalProfitPay = activeBusinessInvestments.reduce((sum, inv) => {
    const trend = marketTrends[businessId] || 0;
    const liveProfit = inv.amount * (trend / 100);
    return sum + Math.max(0, liveProfit);
  }, 0);
  
  
  const [investorSearchQuery, setInvestorSearchQuery] = useState("");
  
  const payin = state.investments
    .filter(i => i.businessId === businessId)
    .reduce((sum, i) => sum + i.amount, 0);
  
  const payout = state.investments
    .filter(i => i.businessId === businessId && i.status === "completed")
    .reduce((sum, i) => sum + (i.amount + (i.amount * (i.interestRate || 0) / 100)), 0);

  const bankTransactions = getUnifiedTransactions(
    business.ownerName,
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );
  const authoritiesAssistance = bankTransactions
    .filter(tx => tx.category === "sahay")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const ownerProfit = state.investments
    .filter((inv) => inv.businessId === businessId)
    .reduce((sum, inv) => sum + (inv.amount * (inv.interestRate || 0)) / 100, 0);

  const unifiedBalance = getUnifiedBankBalance(
    business.ownerName,
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );

  const ownerInvestor = state.investors.find((inv) => inv.name === business.ownerName);
  
  const allTimeInvestments = state.investments.filter((inv) => inv.businessId === businessId && inv.status !== 'defaulted');
  const allTimeInvestedAmount = allTimeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
  const profitTakenOut = allTimeInvestments
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + ((inv.payoutDetails?.totalCredited || inv.amount) - inv.amount), 0);
    
  const maxInvestment = allTimeInvestments.length > 0 ? Math.max(...allTimeInvestments.map(inv => inv.amount)) : 0;
  const minInvestment = allTimeInvestments.length > 0 ? Math.min(...allTimeInvestments.map(inv => inv.amount)) : 0;
  
  const totalProfitGiven = Math.max(0, profitTakenOut + totalProfitPay); 
  const suggestedPriceCalc = Math.max(1000, Math.round((allTimeInvestedAmount + totalProfitGiven) * 0.1));
  const suggestedTriggerPrice = business.fundingRequired ? Math.min(suggestedPriceCalc, business.fundingRequired) : suggestedPriceCalc;

  const valueAmount = totalFunded + totalProfitPay + ownerProfit;
  const valuePercentage = totalFunded > 0 ? ((valueAmount - totalFunded) / totalFunded) * 100 : 0;

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      const updatedOwnerName = formData.ownerName.trim();
      
      dispatch({
        type: "UPDATE_BUSINESS",
        payload: {
          ...business,
          name: formData.name,
          shortName: formData.shortName ? formData.shortName.toUpperCase() : "",
          description: formData.description,
          location: formData.location,
          photoUrl: formData.photoUrl,
          ownerName: updatedOwnerName || business.ownerName,
        },
      });

      if (updatedOwnerName && updatedOwnerName !== business.ownerName) {
        state.businesses.forEach(b => {
          if (b.ownerName === business.ownerName && b.id !== business.id) {
            dispatch({
              type: "UPDATE_BUSINESS",
              payload: { ...b, ownerName: updatedOwnerName }
            });
          }
        });
        state.investors.forEach(inv => {
          if (inv.name === business.ownerName) {
            dispatch({
              type: "UPDATE_INVESTOR",
              payload: { ...inv, name: updatedOwnerName }
            });
          }
        });
      }

      setIsSavingProfile(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setCurrentView("menu");
    }, 1000);
  };

  const [isSavingCompanyInfo, setIsSavingCompanyInfo] = useState(false);
  const handleSaveCompanyInfo = () => {
    setIsSavingCompanyInfo(true);
    setTimeout(() => {
      dispatch({
        type: "UPDATE_BUSINESS",
        payload: {
          ...business,
          companyInfo: {
            ...companyInfoData
          }
        },
      });
      setIsSavingCompanyInfo(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setCurrentView("profile");
    }, 1000);
  };

  const handleSaveTrigger = () => {
    const amount = parseFloat(triggerConfig.amount.toString().replace(/,/g, '')) || 0;
    const minQty = parseInt(triggerConfig.minQuantity.toString().replace(/,/g, '')) || 0;
    const maxQty = parseInt(triggerConfig.maxQuantity.toString().replace(/,/g, '')) || 0;
    
    // Add to history if it's trigger type and a valid amount
    const newHistory = [...(business.triggerHistory || [])];
    if (triggerConfig.type === 'trigger' && amount > 0) {
      newHistory.push({
        id: crypto.randomUUID(),
        amount: amount,
        timestamp: new Date().toISOString()
      });
    }

    setIsSavingTrigger(true);
    setTimeout(() => {
      dispatch({
        type: "UPDATE_BUSINESS",
        payload: {
          ...business,
          investmentType: triggerConfig.type as 'manual' | 'trigger',
          triggerAmount: amount,
          triggerMinQuantity: minQty > 0 ? minQty : undefined,
          triggerMaxQuantity: maxQty > 0 ? maxQty : undefined,
          increaseMarket: parseFloat(triggerConfig.increaseMarket) || undefined,
          downMarket: parseFloat(triggerConfig.downMarket) || undefined,
          triggerHistory: newHistory
        },
      });
      setIsSavingTrigger(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    }, 1000);
  };

  const handleSaveFunds = () => {
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        fundingRequired: parseFloat(formData.fundingRequired.toString().replace(/,/g, '')) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        status: formData.status as Business["status"],
      },
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleFundingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setFormData({...formData, fundingRequired: ''});
      return;
    }
    const numberValue = parseInt(rawValue, 10);
    const formattedValue = new Intl.NumberFormat('en-IN').format(numberValue);
    setFormData({...formData, fundingRequired: formattedValue});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageUrl(reader.result?.toString() || null);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    setFormData({ ...formData, photoUrl: croppedUrl });
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        photoUrl: croppedUrl,
      },
    });
    setCropImageUrl(null);
  };

  const handleDeleteBusiness = () => {
    setIsDeleting(true);
    setTimeout(() => {
      dispatch({ type: "DELETE_BUSINESS", payload: businessId });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      if (onDelete) {
        onDelete();
      } else {
        onBack();
      }
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-kite-surface flex flex-col h-full -mx-3 md:mx-0 px-0 md:px-0 md:rounded-lg animate-slide-in-mobile relative font-sans text-kite-text">
      {/* Header */}
      <div className="bg-white dark:bg-kite-surface px-4 py-3 flex items-center border-b border-kite-border-soft">
        <button onClick={() => currentView === "menu" ? onBack() : currentView === 'trigger-suggestion' || currentView === 'trigger-history' ? setCurrentView('trigger') : setCurrentView("menu")} className="mr-4 text-kite-text flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-medium tracking-wide">
          {currentView === "menu" && "Profile"}
          {currentView === "funds" && "Funds"}
          {currentView === "profile" && "Profile Details"}
          {currentView === "investors" && "Investors details"}
          {currentView === "bank" && "Bank details"}
          {currentView === "registration" && "Registration Information"}
          {currentView === "policy" && "Business Policy"}
          {currentView === "trigger" && "Trigger Price Set"}
          {currentView === "trigger-suggestion" && "Value Overview"}
          {currentView === "trigger-history" && "Trigger Set History"}
        </h1>
      </div>

      {currentView === "menu" && (
        <div className="bg-white dark:bg-kite-surface flex-1">
          <div className="px-5 py-6 flex justify-between items-center border-b border-kite-border-soft">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-normal text-kite-text mb-1 tracking-wide uppercase">{business.shortName ? business.shortName.toUpperCase() : (business.name || "BUSINESS NAME")}</h2>
              <p className="text-[12px] md:text-[13px] text-kite-text-light tracking-normal">{business.ownerName || "Owner Name"}</p>
              <p className="text-[12px] md:text-[13px] text-kite-text-light mt-1">{business.businessId || "ID Number"}</p>
            </div>
            <div className="relative cursor-pointer shrink-0 ml-4" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft relative group">
                {business.photoUrl ? (
                  <img src={business.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl md:text-3xl font-normal">{(business.shortName || business.name)?.substring(0, 2).toUpperCase() || "BU"}</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>
          
          <div className="px-5 py-2 border-b border-kite-border-soft">
            <h3 className="text-[13px] font-medium text-kite-text-light mb-1 mt-2">Account</h3>
            <div className="space-y-0">
              <button onClick={() => setCurrentView("funds")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Funds</span>
                <span className="text-kite-text font-normal text-[16px]">₹</span>
              </button>
              <button onClick={() => setCurrentView("trigger")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Trigger Price Set</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
              <button onClick={() => setCurrentView("profile")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Profile</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
              <button onClick={() => setCurrentView("investors")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Investors details</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
              <button onClick={() => setCurrentView("bank")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Bank details</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
              <button onClick={() => setCurrentView("registration")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Registration Information</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
              <button onClick={() => setCurrentView("policy")} className="w-full py-4 flex justify-between items-center group border-b border-kite-border-soft last:border-0">
                <span className="text-[14px] md:text-[15px] font-normal text-kite-text">Business Policy</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-kite-text transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === "funds" && (
        <div className="p-4 md:p-6 bg-[#F8F9FA] dark:bg-kite-bg flex-1">
          <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border-hard p-5 mb-5 text-center">
            <p className="text-[12px] md:text-[13px] text-kite-text-light font-normal mb-1 flex items-center justify-center gap-1">
              Available balance <Info className="w-3.5 h-3.5 text-kite-blue" />
            </p>
            <p className="text-[26px] md:text-[32px] font-normal text-kite-blue tracking-wide mb-2">
              {unifiedBalance >= 0 ? "" : "-"}₹{formatINR(Math.abs(unifiedBalance)).replace("₹", "")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-white dark:bg-kite-surface rounded p-4 border border-kite-border-hard shadow-sm">
               <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Funding Required (₹)</label>
                    <input
                      type="text"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={formData.fundingRequired}
                      onChange={handleFundingChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={handleSaveFunds} 
                    className={`w-full py-3 rounded text-[14px] md:text-[15px] font-normal mt-2 transition-all duration-300 flex items-center justify-center ${showSuccess ? 'bg-kite-blue text-white' : 'bg-[#4CAF50] dark:bg-[#5B9A5D] text-white'}`}
                  >
                    {showSuccess ? (
                      <span className="flex items-center space-x-2 animate-fade-in">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Funds Added</span>
                      </span>
                    ) : (
                      "+ Add funds"
                    )}
                  </button>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-kite-surface border border-kite-border-hard rounded">
            <div className="px-4 py-3 flex justify-between items-center border-b border-kite-border-soft">
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">Opening balance</span>
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">{formatINR(business.fundingRequired).replace("₹", "")}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center border-b border-kite-border-soft">
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">Payin</span>
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">{formatINR(payin).replace("₹", "")}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center border-b border-kite-border-soft">
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">Payout</span>
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">{formatINR(payout).replace("₹", "")}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center border-b border-kite-border-soft bg-kite-blue/5">
              <span className="text-[13px] md:text-[14px] font-medium text-kite-blue">Owner Profit</span>
              <span className="text-[13px] md:text-[14px] font-medium text-kite-blue">{formatINR(ownerProfit).replace("₹", "")}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center border-b border-kite-border-soft">
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">Authorities</span>
              <span className="text-[13px] md:text-[14px] font-normal text-kite-text">{formatINR(authoritiesAssistance).replace("₹", "")}</span>
            </div>
          </div>
        </div>
      )}

      {currentView === "profile" && (
        <div className="p-4 md:p-6 bg-white dark:bg-kite-surface flex-1 space-y-5">
           <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-[11px] md:text-[12px] font-normal text-kite-text-light uppercase">Business Name</label>
               {editingFields.name && (
                 <button onClick={() => setEditingFields({...editingFields, name: false})} className="text-[11px] md:text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] hover:text-[#388E3C] transition-colors border border-[#4CAF50] dark:border-[#5B9A5D] px-2 py-0.5 rounded">
                   Verified
                 </button>
               )}
             </div>
             {!editingFields.name ? (
               <div className="w-full border-b border-kite-border-hard py-1.5 flex justify-between items-center group">
                 <div className="text-[14px] md:text-[15px] font-normal text-kite-text uppercase flex items-center gap-1.5">
                   {formData.name} <VerifiedBadge />
                 </div>
                 <button onClick={() => setEditingFields({...editingFields, name: true})} className="text-kite-text-light hover:text-kite-text transition-colors">
                   <Pencil className="w-3.5 h-3.5" />
                 </button>
               </div>
             ) : (
               <input
                 type="text"
                 className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none uppercase"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
               />
             )}
           </div>
           <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-[11px] md:text-[12px] font-normal text-kite-text-light uppercase">Business Owner Name</label>
               {editingFields.ownerName && (
                 <button onClick={() => setEditingFields({...editingFields, ownerName: false})} className="text-[11px] md:text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] hover:text-[#388E3C] transition-colors border border-[#4CAF50] dark:border-[#5B9A5D] px-2 py-0.5 rounded">
                   Verified
                 </button>
               )}
             </div>
             {!editingFields.ownerName ? (
               <div className="w-full border-b border-kite-border-hard py-1.5 flex justify-between items-center group">
                 <div className="text-[14px] md:text-[15px] font-normal text-kite-text flex items-center gap-1.5">
                   {formData.ownerName} <VerifiedBadge />
                 </div>
                 <button onClick={() => setEditingFields({...editingFields, ownerName: true})} className="text-kite-text-light hover:text-kite-text transition-colors">
                   <Pencil className="w-3.5 h-3.5" />
                 </button>
               </div>
             ) : (
               <input
                 type="text"
                 className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                 value={formData.ownerName}
                 onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                 placeholder="Enter owner name"
               />
             )}
           </div>
           <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-[11px] md:text-[12px] font-normal text-kite-text-light uppercase">Short Business Name</label>
               {editingFields.shortName && (
                 <button onClick={() => setEditingFields({...editingFields, shortName: false})} className="text-[11px] md:text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] hover:text-[#388E3C] transition-colors border border-[#4CAF50] dark:border-[#5B9A5D] px-2 py-0.5 rounded">
                   Verified
                 </button>
               )}
             </div>
             {!editingFields.shortName ? (
               <div className="w-full border-b border-kite-border-hard py-1.5 flex justify-between items-center group">
                 <div className="text-[14px] md:text-[15px] font-normal text-kite-text uppercase flex items-center gap-1.5">
                   {formData.shortName} <VerifiedBadge />
                 </div>
                 <button onClick={() => setEditingFields({...editingFields, shortName: true})} className="text-kite-text-light hover:text-kite-text transition-colors">
                   <Pencil className="w-3.5 h-3.5" />
                 </button>
               </div>
             ) : (
               <input
                 type="text"
                 className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none uppercase"
                 value={formData.shortName}
                 onChange={(e) => setFormData({...formData, shortName: e.target.value.toUpperCase()})}
                 placeholder="e.g. ACME"
               />
             )}
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Company info</label>
             <button
               onClick={() => setCurrentView("company-info")}
               className="w-full border border-kite-border-hard py-3 px-4 rounded bg-transparent text-[14px] md:text-[15px] font-normal text-kite-blue hover:bg-kite-border-soft transition-colors flex justify-between items-center"
             >
               <span>Information & Legal Docs</span>
               <ChevronRight className="w-4 h-4" />
             </button>
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Location</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.location}
               onChange={(e) => setFormData({...formData, location: e.target.value})}
             />
           </div>
           <div className="pt-4 flex justify-end gap-3">
             <button onClick={() => setCurrentView("menu")} disabled={isSavingProfile} className="px-5 py-2 text-kite-text border border-kite-border-hard rounded font-normal text-[14px] disabled:opacity-50">Cancel</button>
             <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-5 py-2 min-w-[120px] flex justify-center items-center bg-kite-blue text-white rounded font-normal text-[14px] disabled:opacity-80">
               {isSavingProfile ? (
                 <span className="flex items-center space-x-2">
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>Saving...</span>
                 </span>
               ) : "Save info"}
             </button>
           </div>
           {onDelete && (
             <div className="pt-8 border-t border-kite-border-soft mt-8">
               <button onClick={onDelete} className="w-full text-center text-[#DF514C] dark:text-[#E25F5B] border border-[#DF514C] dark:border-[#E25F5B] hover:bg-[#DF514C]/$1 dark:hover:bg-[#E25F5B]/$1 rounded py-3 font-normal text-[14px] transition-colors">
                 Delete Business
               </button>
             </div>
           )}
        </div>
      )}

      {currentView === "company-info" && (
        <div className="p-4 md:p-6 bg-white dark:bg-kite-surface flex-1 space-y-5">
           <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-[11px] md:text-[12px] font-normal text-kite-text-light uppercase">1 COMPANY NAME</label>
               <button
                 type="button"
                 onClick={() => setCompanyInfoData({...companyInfoData, companyName: formData.name})}
                 className="text-[11px] md:text-[12px] font-medium text-kite-blue hover:text-blue-600 transition-colors"
               >
                 Fill Auto
               </button>
             </div>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={companyInfoData.companyName}
               onChange={(e) => setCompanyInfoData({...companyInfoData, companyName: e.target.value})}
             />
           </div>

           <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-[11px] md:text-[12px] font-normal text-kite-text-light uppercase">2 OWNER NAME</label>
               <button
                 type="button"
                 onClick={() => setCompanyInfoData({...companyInfoData, ownerName: formData.ownerName})}
                 className="text-[11px] md:text-[12px] font-medium text-kite-blue hover:text-blue-600 transition-colors"
               >
                 Fill Auto
               </button>
             </div>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={companyInfoData.ownerName}
               onChange={(e) => setCompanyInfoData({...companyInfoData, ownerName: e.target.value})}
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">3 SINCE</label>
             <input
               type="number"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={companyInfoData.since}
               onChange={(e) => setCompanyInfoData({...companyInfoData, since: e.target.value})}
               placeholder="e.g. 2024"
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">4 DOCUMENTS</label>
             <div className="flex items-center gap-2 mb-2">
               <input
                 type="text"
                 className="flex-1 border-b border-kite-border-hard py-1 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                 value={newDocument}
                 onChange={(e) => setNewDocument(e.target.value)}
                 placeholder="e.g. permit license : ASDF67687"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && newDocument.trim()) {
                     setCompanyInfoData({...companyInfoData, documents: [...companyInfoData.documents, newDocument.trim()]});
                     setNewDocument("");
                   }
                 }}
               />
               <button
                 onClick={() => {
                   if (newDocument.trim()) {
                     setCompanyInfoData({...companyInfoData, documents: [...companyInfoData.documents, newDocument.trim()]});
                     setNewDocument("");
                   }
                 }}
                 className="text-kite-blue p-1 rounded hover:bg-kite-blue/10 transition-colors"
               >
                 <Plus className="w-5 h-5" />
               </button>
             </div>
             <div className="space-y-2 mt-2">
               {companyInfoData.documents.map((doc, index) => (
                 <div key={index} className="flex justify-between items-center bg-[#F8F9FA] dark:bg-kite-bg p-2 px-3 rounded text-[13px] md:text-[14px]">
                   <span className="flex items-center gap-1.5">{doc} <BlueVerifiedBadge /></span>
                   <button
                     onClick={() => {
                       const newDocs = [...companyInfoData.documents];
                       newDocs.splice(index, 1);
                       setCompanyInfoData({...companyInfoData, documents: newDocs});
                     }}
                     className="text-[#DF514C] dark:text-[#E25F5B] hover:bg-[#DF514C]/$1 dark:hover:bg-[#E25F5B]/$1 p-1 rounded transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">5 GOVERMENT REG IDENTIFIES</label>
             <div className="flex items-center gap-2 mb-2">
               <input
                 type="text"
                 className="flex-1 border-b border-kite-border-hard py-1 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                 value={newIdentifier}
                 onChange={(e) => setNewIdentifier(e.target.value)}
                 placeholder="e.g. GST Number, City Tax"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && newIdentifier.trim()) {
                     setCompanyInfoData({...companyInfoData, governmentRegIdentifies: [...companyInfoData.governmentRegIdentifies, newIdentifier.trim()]});
                     setNewIdentifier("");
                   }
                 }}
               />
               <button
                 onClick={() => {
                   if (newIdentifier.trim()) {
                     setCompanyInfoData({...companyInfoData, governmentRegIdentifies: [...companyInfoData.governmentRegIdentifies, newIdentifier.trim()]});
                     setNewIdentifier("");
                   }
                 }}
                 className="text-kite-blue p-1 rounded hover:bg-kite-blue/10 transition-colors"
               >
                 <Plus className="w-5 h-5" />
               </button>
             </div>
             <div className="space-y-2 mt-2">
               {companyInfoData.governmentRegIdentifies.map((id, index) => (
                 <div key={index} className="flex justify-between items-center bg-[#F8F9FA] dark:bg-kite-bg p-2 px-3 rounded text-[13px] md:text-[14px]">
                   <span className="flex items-center gap-1.5">{id} <BlueVerifiedBadge /></span>
                   <button
                     onClick={() => {
                       const newIds = [...companyInfoData.governmentRegIdentifies];
                       newIds.splice(index, 1);
                       setCompanyInfoData({...companyInfoData, governmentRegIdentifies: newIds});
                     }}
                     className="text-[#DF514C] dark:text-[#E25F5B] hover:bg-[#DF514C]/$1 dark:hover:bg-[#E25F5B]/$1 p-1 rounded transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">6 COMPANY INFORMATION</label>
             <textarea
               className="w-full border border-kite-border-hard rounded-md p-3 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[100px]"
               value={companyInfoData.companyInformation}
               onChange={(e) => setCompanyInfoData({...companyInfoData, companyInformation: e.target.value})}
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">7 PROFIT REVENUE & INVEST</label>
             <textarea
               className="w-full border border-kite-border-hard rounded-md p-3 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[100px]"
               value={companyInfoData.profitRevenueInvest}
               onChange={(e) => setCompanyInfoData({...companyInfoData, profitRevenueInvest: e.target.value})}
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">8 INVESTMENTS IDEA</label>
             <textarea
               className="w-full border border-kite-border-hard rounded-md p-3 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[100px]"
               value={companyInfoData.investmentIdea}
               onChange={(e) => setCompanyInfoData({...companyInfoData, investmentIdea: e.target.value})}
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">9 COMPANY SHARE HOLDER</label>
             <textarea
               className="w-full border border-kite-border-hard rounded-md p-3 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[100px]"
               value={companyInfoData.companyShareHolder}
               onChange={(e) => setCompanyInfoData({...companyInfoData, companyShareHolder: e.target.value})}
             />
           </div>

           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">10 COMPNAY ADDRESS</label>
             <textarea
               className="w-full border border-kite-border-hard rounded-md p-3 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-y min-h-[80px]"
               value={companyInfoData.companyAddress}
               onChange={(e) => setCompanyInfoData({...companyInfoData, companyAddress: e.target.value})}
             />
           </div>

           <div className="pt-4 flex justify-end gap-3">
             <button onClick={() => setCurrentView("profile")} disabled={isSavingCompanyInfo} className="px-5 py-2 text-kite-text border border-kite-border-hard rounded font-normal text-[14px] disabled:opacity-50">Cancel</button>
             <button onClick={handleSaveCompanyInfo} disabled={isSavingCompanyInfo} className="px-5 py-2 min-w-[120px] flex justify-center items-center bg-kite-blue text-white rounded font-normal text-[14px] disabled:opacity-80">
               {isSavingCompanyInfo ? (
                 <span className="flex items-center space-x-2">
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>Saving...</span>
                 </span>
               ) : "Save"}
             </button>
           </div>
        </div>
      )}
      {currentView === "investors" && (
        <div className="bg-[#F8F9FA] dark:bg-kite-bg flex-1">
          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex items-center justify-start gap-2">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Funded (₹)</p>
             <p className="text-[16px] font-normal text-[#4CAF50] dark:text-[#5B9A5D]">{formatINR(totalFunded).replace("₹", "")}</p>
          </div>
          <div className="hidden md:flex bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft justify-start gap-2 items-center">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Profit Pay (-₹)</p>
             <p className="text-[16px] font-normal text-[#E25F5B] dark:text-[#E25F5B]">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>
          <div className="md:hidden bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-start gap-2 items-center">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Total Profit Pay (-₹)</p>
             <p className="text-[16px] font-normal text-[#E25F5B] dark:text-[#E25F5B]">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>
          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex items-center justify-start gap-2">
             <p className="text-[16px] text-[#444444] dark:text-[#BBBBBB] font-normal capitalize">Investor</p>
             <p className="text-[16px] font-normal text-[#4987EE] dark:text-[#4987EE]">{activeBusinessInvestments.length}</p>
          </div>
          
          <div className="bg-white dark:bg-kite-surface pt-2 border-b border-kite-border-soft mt-4">
             <div className="px-5 py-3 border-b border-kite-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
               <h3 className="text-[17px] font-normal text-kite-text-light capitalize tracking-wider">Available Investor</h3>
               <div className="relative hidden md:block">
                 <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light" />
                 <input
                   type="text"
                   placeholder="Search..."
                   value={investorSearchQuery}
                   onChange={(e) => setInvestorSearchQuery(e.target.value)}
                   className="w-full md:w-[240px] pl-8 pr-3 py-1.5 text-[13px] border border-kite-border-soft dark:border-kite-border-hard bg-white dark:bg-kite-bg text-kite-text rounded-sm focus:outline-none focus:border-kite-blue focus:ring-[0.5px] focus:ring-kite-blue transition-all"
                 />
               </div>
             </div>
             
             <div className="hidden md:block overflow-x-auto w-full max-w-full">
               <table className="w-full text-left text-[13px] md:text-[14px] min-w-[800px]">
                 <thead className="border-b-2 border-black dark:border-kite-border font-medium capitalize tracking-wider text-[#9B9B9B] dark:text-[#666666]">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48 text-[12px]">Investor Name</th>
                     <th className="py-4 px-4 text-right text-[12px]">Equity Amount (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">Margin (₹)</th>
                     <th className="py-4 px-4 text-right text-[12px]">My Profit (₹)</th>
                     <th className="py-4 px-4 text-center text-[12px]">Qty.</th>
                     <th className="py-4 pr-5 pl-4 text-right text-[12px]">Holding</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-kite-border-soft text-[14px] investor-table-body">
                   {businessInvestments.filter(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
                   }).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (inv.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted 
                        ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                        : (inv.amount * (trend / 100));
                     const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                     
                     return (
                       <tr key={`biz_inv_desk_${inv.id}_${idx}`} className="hover:bg-kite-bg transition-colors group">
                         <td className="!py-[10px] !px-[12px] text-[#444444] dark:text-[#BBBBBB] font-medium whitespace-nowrap capitalize !text-[14px]">
                           {investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right font-mono font-medium !text-[14px] text-[#444444] dark:text-[#BBBBBB]">
                           {formatCompactZerodha(inv.amount)}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right font-mono font-medium text-[#4CAF50] dark:text-[#5B9A5D] !text-[14px]">
                           {`${liveProfit >= 0 ? "+" : ""}${formatCompactZerodha(liveProfit)}`}
                         </td>
                         <td className={`!py-[10px] !px-[12px] text-right font-mono font-medium !text-[14px] ${isCompleted ? 'text-[#FF5722] dark:text-[#D4603B]' : 'text-[#444444] dark:text-[#BBBBBB]'}`}>
                           {formatCompactZerodha(ownerProfit)}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-center text-[#444444] dark:text-[#BBBBBB] !text-[14px]">
                           {qty}
                         </td>
                         <td className="!py-[10px] !px-[12px] text-right !text-[14px]">
                           <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize font-medium tracking-wider" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize font-medium tracking-wider"}>
                             {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
                           </span>
                         </td>
                       </tr>
                     )
                   })}
                   {businessInvestments.filter(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
                   }).length === 0 && (
                     <tr><td colSpan={6} className="py-12 text-center text-kite-text-light font-medium">No investors found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             <div className="divide-y divide-kite-border-soft md:hidden">
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 const trend = marketTrends[businessId] || 0;
                 const isCompleted = inv.status === "completed";
                 const liveProfit = isCompleted 
                    ? ((inv.payoutDetails?.totalCredited || inv.amount) + (inv.payoutDetails?.rmasCommission || 0) + (inv.payoutDetails?.happyIncomeTax || 0) - inv.amount) 
                    : (inv.amount * (trend / 100));
                 const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
                 return (
                   <div key={`biz_inv_mob_${inv.id}_${idx}`} className="!py-[10px] !px-[12px] flex justify-between items-center">
                      <div>
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB] capitalize">{investor?.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Unknown"}</p>
                        <p className="!text-[12px] text-[#444444] dark:text-[#BBBBBB] mt-0.5">{qty} Qty. • <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize"}>{inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="!text-[14px] font-normal text-[#444444] dark:text-[#BBBBBB]">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="!text-[12px] font-medium text-[#4CAF50] dark:text-[#5B9A5D] mt-0.5">{`${liveProfit >= 0 ? "+" : ""}${formatCompactZerodha(liveProfit)}`}</p>
                      </div>
                   </div>
                 )
               })}
               {businessInvestments.filter(inv => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
               }).length === 0 && (
                 <div className="p-6 text-center text-kite-text-light text-[13px] font-normal">
                   No investors found.
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {currentView === "bank" && (
        <div className="bg-white dark:bg-kite-surface flex-1 p-4 md:p-6 space-y-5">
           {business.bankDetails ? (
             <div className="space-y-5">
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Bank Name</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{business.bankDetails.bankName}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Account Number</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text tracking-wider">{business.bankDetails.accountNumber}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">IFSC</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text tracking-wider">{business.bankDetails.ifscCode}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Account Holder</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text uppercase">{business.bankDetails.accountHolderName}</p>
                </div>
             </div>
           ) : (
             <div className="text-center py-10 text-kite-text-light text-[14px] font-normal">
               No bank details recorded.
             </div>
           )}
        </div>
      )}

      {currentView === "registration" && (
        <div className="bg-white dark:bg-kite-surface flex-1 p-4 md:p-6 space-y-5">
           <div className="border-b border-kite-border-soft pb-4">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Date Registered</p>
             <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{new Date(business.registrationDate).toLocaleDateString("en-IN")}</p>
           </div>
           <div className="border-b border-kite-border-soft pb-4">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Commission Paid</p>
             <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(business.registrationCommissionPaid)}</p>
           </div>
           <div className="border-b border-kite-border-soft pb-4">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Tax Collected</p>
             <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(business.taxPaid)}</p>
           </div>
           <div className="border-b border-kite-border-soft pb-4">
             <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Setup Revenue</p>
             <p className="text-[15px] md:text-[16px] font-normal text-kite-blue">{formatINR(business.registrationCommissionPaid + business.taxPaid)}</p>
           </div>
        </div>
      )}

      {currentView === "policy" && (
        <div className="bg-white dark:bg-kite-surface flex-1 p-4 md:p-6 flex flex-col h-full relative">
          {!showDeleteConfirm ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-medium text-kite-text">Danger Zone</h3>
                <p className="text-[13px] text-kite-text-light mt-1">Actions here can have permanent consequences.</p>
              </div>
              <div className="border border-red-200 dark:border-red-900/30 rounded p-4 flex flex-col items-start gap-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#DF514C] dark:text-[#E25F5B] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B]">Permanent Business Delete</h4>
                    <p className="text-[12px] md:text-[13px] text-[#DF514C] dark:text-[#E25F5B]/80 dark:text-[#E25F5B]/80 mt-1 leading-relaxed">
                      This action will permanently delete this business. Any investors who have invested in this business will have their invested amount refunded to their bank account balance immediately. All records of this business will be permanently destroyed.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-[#DF514C] dark:text-[#E25F5B] text-[13px] font-medium rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Business
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center px-4 max-w-sm mx-auto h-full my-auto pb-20">
              <div className={`w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 ${isDeleting ? "animate-pulse" : ""}`}>
                <Trash2 className={`w-8 h-8 text-[#DF514C] dark:text-[#E25F5B] ${isDeleting ? "animate-bounce" : ""}`} />
              </div>
              <h3 className="text-[18px] font-medium text-kite-text mb-2">Are you absolutely sure?</h3>
              <p className="text-[13px] text-kite-text-light mb-8">
                This will permanently delete <strong>{business.name}</strong>. Investor amounts will be refunded. This cannot be undone.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleDeleteBusiness}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-[14px] font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, delete business"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-transparent border border-kite-border text-kite-text text-[14px] font-medium rounded hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentView === "trigger" && (
        <div className="bg-white dark:bg-kite-surface flex-1 p-4 md:p-6 space-y-6">
          <div className="space-y-4 mb-6 pb-6 border-b border-kite-border-soft">
            <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text">Funding Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">Total Investments ₹</p>
                <p className="text-[15px] font-medium text-kite-text">{formatINR(totalFunded)}</p>
              </div>
              <div 
                className="cursor-pointer hover:bg-gray-50 dark:md:hover:bg-[#131415] p-2 -m-2 rounded transition-colors"
                onClick={() => setCurrentView("trigger-suggestion")}
              >
                <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1 flex items-center gap-1">Value <ChevronRight className="w-3 h-3"/></p>
                <p className={`text-[15px] font-medium ${valueAmount >= totalFunded ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                  {formatINR(valueAmount)} <span className="text-[12px] font-normal opacity-90">({valuePercentage > 0 ? '+' : ''}{valuePercentage.toFixed(2)}%)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text mb-4">Investment Mode</h3>
            <div className="flex bg-gray-100 dark:bg-kite-bg p-1 rounded-md">
              <button 
                onClick={() => setTriggerConfig({ ...triggerConfig, type: 'manual' })}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded transition-colors ${triggerConfig.type === 'manual' ? 'bg-white dark:bg-kite-surface text-kite-blue shadow-sm' : 'text-kite-text-light hover:text-kite-text'}`}
              >
                Manual Price
              </button>
              <button 
                onClick={() => setTriggerConfig({ ...triggerConfig, type: 'trigger' })}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded transition-colors ${triggerConfig.type === 'trigger' ? 'bg-white dark:bg-kite-surface text-kite-blue shadow-sm' : 'text-kite-text-light hover:text-kite-text'}`}
              >
                Trigger Price
              </button>
            </div>
            
            {triggerConfig.type === 'trigger' && (
              <div className="mt-6 pt-4 border-t border-kite-border-soft animate-fade-in space-y-6">
                <div>
                  <label className="block text-[10px] md:text-[11px] font-normal mb-1 text-kite-text-light uppercase">per share price ₹</label>
                  <input
                    type="text"
                    className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                    value={triggerConfig.amount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      if (!rawValue) {
                        setTriggerConfig({ ...triggerConfig, amount: "" });
                        return;
                      }
                      const numberValue = parseInt(rawValue, 10);
                      const formattedValue = new Intl.NumberFormat('en-IN').format(numberValue);
                      setTriggerConfig({ ...triggerConfig, amount: formattedValue });
                    }}
                    placeholder="e.g. 10,000"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] md:text-[11px] font-normal mb-1 text-kite-text-light uppercase">Min Qty</label>
                    <input
                      type="text"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={triggerConfig.minQuantity}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (!rawValue) {
                          setTriggerConfig({ ...triggerConfig, minQuantity: "" });
                          return;
                        }
                        const numberValue = parseInt(rawValue, 10);
                        const formattedValue = new Intl.NumberFormat('en-IN').format(numberValue);
                        setTriggerConfig({ ...triggerConfig, minQuantity: formattedValue });
                      }}
                      placeholder="e.g. 1"
                    />
                    {triggerConfig.amount && triggerConfig.minQuantity && (
                      <div className="mt-1 text-[11px] text-kite-text-light">
                        ₹{new Intl.NumberFormat('en-IN').format(
                          (parseInt(triggerConfig.amount.toString().replace(/,/g, '')) || 0) * (parseInt(triggerConfig.minQuantity.toString().replace(/,/g, '')) || 0)
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] md:text-[11px] font-normal mb-1 text-kite-text-light uppercase">Max Qty</label>
                    <input
                      type="text"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={triggerConfig.maxQuantity}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (!rawValue) {
                          setTriggerConfig({ ...triggerConfig, maxQuantity: "" });
                          return;
                        }
                        const numberValue = parseInt(rawValue, 10);
                        const formattedValue = new Intl.NumberFormat('en-IN').format(numberValue);
                        setTriggerConfig({ ...triggerConfig, maxQuantity: formattedValue });
                      }}
                      placeholder="e.g. 10"
                    />
                    {triggerConfig.amount && triggerConfig.maxQuantity && (
                      <div className="mt-1 text-[11px] text-kite-text-light">
                        ₹{new Intl.NumberFormat('en-IN').format(
                          (parseInt(triggerConfig.amount.toString().replace(/,/g, '')) || 0) * (parseInt(triggerConfig.maxQuantity.toString().replace(/,/g, '')) || 0)
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSaveTrigger} 
            className={`w-full py-3 rounded text-[14px] md:text-[15px] font-medium mt-4 transition-all duration-300 flex items-center justify-center bg-kite-blue text-white hover:bg-kite-blue-dark`}
          >
            {isSavingTrigger ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Confirming...</span>
              </span>
            ) : showSuccess ? (
              <span className="flex items-center space-x-2 animate-fade-in">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>verifed value</span>
              </span>
            ) : (
              "Confirm"
            )}
          </button>

          <div className="pt-6 mt-6 border-t border-kite-border-soft">
            <button 
              onClick={() => setCurrentView("trigger-history")}
              className="w-full py-3 bg-white dark:bg-transparent border border-kite-border-hard text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors rounded text-[14px] md:text-[15px] font-normal flex items-center justify-between px-4"
            >
              <span>View Trigger Set History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {currentView === "trigger-history" && (
        <div className="bg-[#F8F9FA] dark:bg-kite-bg flex-1 p-0 overflow-y-auto">
          {business.triggerHistory && business.triggerHistory.length > 0 ? (
            <div className="divide-y divide-kite-border-soft bg-white dark:bg-kite-surface">
              {business.triggerHistory.slice().reverse().map((history) => {
                // Find investments that match this trigger amount
                const matchingInvestments = state.investments.filter(inv => 
                  inv.businessId === business.id && 
                  inv.amount === history.amount
                );
                
                return (
                  <div key={history.id} className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[12px] text-kite-text-light">{new Date(history.timestamp).toLocaleString('en-IN')}</span>
                        <div className="text-[15px] font-medium text-kite-text mt-0.5 flex items-center gap-1.5">
                          Trigger Set: <span className="text-kite-blue">{formatINR(history.amount)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] text-kite-text-light uppercase block">Investors</span>
                        <span className="text-[14px] font-medium text-kite-text">{matchingInvestments.length}</span>
                      </div>
                    </div>
                    {matchingInvestments.length > 0 && (
                      <div className="mt-2 text-[13px] text-kite-text-light bg-[#F8F9FA] dark:bg-kite-bg p-2 rounded truncate border border-kite-border-soft">
                        {matchingInvestments.map(inv => {
                          const investor = state.investors.find(i => i.id === inv.investorId);
                          return `${investor?.name || 'Unknown'}: ₹${inv.amount}`;
                        }).join(' | ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-kite-text-light text-[14px]">
              No trigger history found.
            </div>
          )}
        </div>
      )}

      {currentView === "trigger-suggestion" && (
        <div className="bg-white dark:bg-kite-surface flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center gap-4 border-b border-kite-border-soft pb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-kite-bg shrink-0">
              {business.photoUrl ? (
                <img src={business.photoUrl} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[24px] font-medium text-kite-text-light">
                  {business.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-[18px] md:text-[20px] font-medium text-kite-text">{business.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {ownerInvestor?.photoUrl && (
                  <img src={ownerInvestor.photoUrl} alt={ownerInvestor.name} className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="text-[13px] text-kite-text-light">Owned by {business.ownerName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-2">
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Invested</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(allTimeInvestedAmount)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Active Invested</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(totalFunded)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Highest Inv.</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(maxInvestment)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Lowest Inv.</span>
                <span className="text-[14px] text-kite-text">{formatCompactZerodha(minInvestment)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Profit Taken Out</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">
                  {formatCompactZerodha(profitTakenOut)} 
                  <span className="text-[11px] text-kite-text-light font-sans ml-1">({allTimeInvestedAmount > 0 ? ((profitTakenOut/allTimeInvestedAmount)*100).toFixed(1) : 0}%)</span>
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-kite-text-light uppercase tracking-wider mb-1">Total Profit Given</span>
                <span className="text-[14px] text-[#4CAF50] dark:text-[#5B9A5D]">
                  {formatCompactZerodha(totalProfitGiven)} 
                  <span className="text-[11px] text-kite-text-light font-sans ml-1">({allTimeInvestedAmount > 0 ? ((totalProfitGiven/allTimeInvestedAmount)*100).toFixed(1) : 0}%)</span>
                </span>
              </div>
            </div>
            
            <div className="mt-2 mb-2">
              <div className="flex justify-between text-[11px] text-kite-text-light mb-1">
                <span>Low: {formatCompactZerodha(minInvestment)}</span>
                <span>High: {formatCompactZerodha(maxInvestment)}</span>
              </div>
              <div className="h-1 bg-kite-border-soft rounded-full overflow-hidden flex relative">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-kite-blue opacity-30" 
                  style={{ width: `${maxInvestment > 0 ? (allTimeInvestedAmount / maxInvestment) * 100 : 0}%`, maxWidth: '100%' }}
                ></div>
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-kite-blue" 
                  style={{ width: `${maxInvestment > 0 ? (totalFunded / maxInvestment) * 100 : 0}%`, maxWidth: '100%' }}
                ></div>
              </div>
            </div>
          </div>

                    <div className="border border-kite-border-soft rounded mt-4 overflow-hidden">
            <div className="p-3 border-b border-kite-border-soft flex justify-between items-center bg-gray-50 dark:bg-kite-bg/50">
               <span className="text-[12px] font-medium text-kite-text uppercase tracking-wide">Mange market cap Per Qty</span>
            </div>
            <div className="p-4 bg-white dark:bg-kite-surface flex flex-col gap-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1 block">Value Market %</label>
                   <input
                     type="number"
                     step="0.01"
                     value={triggerConfig.increaseMarket}
                     onChange={(e) => setTriggerConfig({ ...triggerConfig, increaseMarket: e.target.value })}
                     className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] text-kite-text focus:border-kite-blue transition-colors"
                     placeholder="e.g. 2.5"
                   />
                 </div>
                 <div>
                   <label className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1 block">down value market %</label>
                   <input
                     type="number"
                     step="0.01"
                     value={triggerConfig.downMarket}
                     onChange={(e) => setTriggerConfig({ ...triggerConfig, downMarket: e.target.value })}
                     className="w-full bg-transparent border-b border-kite-border outline-none py-2 text-[15px] text-kite-text focus:border-kite-blue transition-colors"
                     placeholder="e.g. 4"
                   />
                 </div>
               </div>
               <button
                onClick={() => {
                  setIsSavingMarket(true);
                  setTimeout(() => {
                    dispatch({
                      type: "UPDATE_BUSINESS",
                      payload: {
                        ...business,
                        increaseMarket: parseFloat(triggerConfig.increaseMarket) || undefined,
                        downMarket: parseFloat(triggerConfig.downMarket) || undefined,
                      }
                    });
                    setIsSavingMarket(false);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2000);
                  }, 1000);
                }}
                className="w-full bg-kite-blue !text-white dark:text-white px-5 py-2.5 rounded text-[13px] font-medium hover:bg-kite-blue-dark transition-colors uppercase tracking-wide mt-2"
              >
                {isSavingMarket ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : showSuccess ? "verifed value" : "confrim market cap"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cropImageUrl && (
        <ImageCropModal 
          imageUrl={cropImageUrl} 
          onClose={() => setCropImageUrl(null)} 
          onCrop={handleCropComplete} 
        />
      )}
    </div>
  );
}
