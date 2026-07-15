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
  AlertTriangle
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

export default function BusinessDetail({
  businessId,
  onBack,
  onDelete,
}: Props) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  const marketTrends = marketState.trends;
  const business = state.businesses.find((b) => b.id === businessId);
  const [currentView, setCurrentView] = useState<"menu" | "funds" | "profile" | "investors" | "bank" | "registration" | "policy" | "trigger" | "trigger-history">("menu");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [triggerConfig, setTriggerConfig] = useState({
    type: business?.investmentType || 'manual',
    amount: business?.triggerAmount ? new Intl.NumberFormat('en-IN').format(business.triggerAmount) : "",
    minQuantity: business?.triggerMinQuantity ? business.triggerMinQuantity.toString() : "",
    maxQuantity: business?.triggerMaxQuantity ? business.triggerMaxQuantity.toString() : "",
  });

  useEffect(() => {
    if (business) {
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
  
  const totalProfitPayMobile = activeBusinessInvestments.reduce(
    (sum, inv) => sum + (inv.amount * (business.interestRate || 0)) / 100,
    0,
  );
  
  const [investorSearchQuery, setInvestorSearchQuery] = useState("");
  
  const payin = state.investments
    .filter(i => i.businessId === businessId)
    .reduce((sum, i) => sum + i.amount, 0);
  
  const payout = state.investments
    .filter(i => i.businessId === businessId && i.status === "completed")
    .reduce((sum, i) => sum + (i.amount + (i.amount * business.interestRate / 100)), 0);

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
    .reduce((sum, inv) => sum + (inv.amount * (business.interestRate || 0)) / 100, 0);

  const unifiedBalance = getUnifiedBankBalance(
    business.ownerName,
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );

  const handleSaveProfile = () => {
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

    setCurrentView("menu");
  };

  const handleSaveTrigger = () => {
    const amount = parseFloat(triggerConfig.amount.toString().replace(/,/g, '')) || 0;
    const minQty = parseInt(triggerConfig.minQuantity) || 0;
    const maxQty = parseInt(triggerConfig.maxQuantity) || 0;
    
    // Add to history if it's trigger type and a valid amount
    const newHistory = [...(business.triggerHistory || [])];
    if (triggerConfig.type === 'trigger' && amount > 0) {
      newHistory.push({
        id: crypto.randomUUID(),
        amount: amount,
        timestamp: new Date().toISOString()
      });
    }

    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        investmentType: triggerConfig.type as 'manual' | 'trigger',
        triggerAmount: amount,
        triggerMinQuantity: minQty > 0 ? minQty : undefined,
        triggerMaxQuantity: maxQty > 0 ? maxQty : undefined,
        triggerHistory: newHistory
      },
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentView("menu");
    }, 1500);
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
        <button onClick={() => currentView === "menu" ? onBack() : setCurrentView("menu")} className="mr-4 text-kite-text flex items-center justify-center">
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
                    className={`w-full py-3 rounded text-[14px] md:text-[15px] font-normal mt-2 transition-all duration-300 flex items-center justify-center ${showSuccess ? 'bg-kite-blue text-white' : 'bg-[#4CAF50] text-white'}`}
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
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Business Owner Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.ownerName}
               onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
               placeholder="Enter owner name"
             />
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Short Business Name</label>
             <input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none uppercase"
               value={formData.shortName}
               onChange={(e) => setFormData({...formData, shortName: e.target.value})}
               placeholder="e.g. ACME"
             />
           </div>
           <div>
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Description</label>
             <textarea
               className={`w-full border-b bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-all duration-200 ${isEditingDescription ? 'border border-kite-border-hard rounded-md p-3 mt-1 resize-y min-h-[150px]' : 'border-kite-border-hard py-1.5 resize-none h-16 overflow-hidden'}`}
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               onFocus={() => setIsEditingDescription(true)}
               onBlur={() => setIsEditingDescription(false)}
               placeholder={isEditingDescription ? "Enter detailed description here..." : "No description"}
             />
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
             <button onClick={() => setCurrentView("menu")} className="px-5 py-2 text-kite-text border border-kite-border-hard rounded font-normal text-[14px]">Cancel</button>
             <button onClick={handleSaveProfile} className="px-5 py-2 bg-kite-blue text-white rounded font-normal text-[14px]">Save Changes</button>
           </div>
           {onDelete && (
             <div className="pt-8 border-t border-kite-border-soft mt-8">
               <button onClick={onDelete} className="w-full text-center text-[#FF5722] border border-[#FF5722] hover:bg-[#FF5722]/5 rounded py-3 font-normal text-[14px] transition-colors">
                 Delete Business
               </button>
             </div>
           )}
        </div>
      )}

      {currentView === "investors" && (
        <div className="bg-[#F8F9FA] dark:bg-kite-bg flex-1">
          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total funded</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalFunded).replace("₹", "")}</p>
          </div>
          <div className="hidden md:flex bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total profit pay</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalProfitPay).replace("₹", "")}</p>
          </div>
          <div className="md:hidden bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Total profit pay</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{formatINR(totalProfitPayMobile).replace("₹", "")}</p>
          </div>
          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Investors</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{activeBusinessInvestments.length}</p>
          </div>
          
          <div className="bg-white dark:bg-kite-surface pt-2 border-b border-kite-border-soft mt-4">
             <div className="px-5 py-3 border-b border-kite-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
               <h3 className="text-[14px] font-normal text-kite-text-light uppercase tracking-wider">Current investors</h3>
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
                 <thead className="border-b-2 border-black dark:border-kite-border font-medium uppercase text-[11px] md:text-[12px] tracking-wider text-kite-text">
                   <tr>
                     <th className="py-4 pl-5 pr-4 w-48">Investor Name</th>
                     <th className="py-4 px-4 text-right">Amount</th>
                     <th className="py-4 px-4 text-right">Owner Profit</th>
                     <th className="py-4 px-4 text-right">Live Profit</th>
                     <th className="py-4 px-4 text-center">Period</th>
                     <th className="py-4 pr-5 pl-4 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-kite-border-soft text-[13px] md:text-[14px]">
                   {businessInvestments.filter(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return investor?.name?.toLowerCase().includes(investorSearchQuery.toLowerCase());
                   }).map((inv, idx) => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     const ownerProfit = (inv.amount * (business.interestRate || 0)) / 100;
                     const trend = marketTrends[businessId] || 0;
                     const isCompleted = inv.status === "completed";
                     const liveProfit = isCompleted ? 0 : inv.amount * (trend / 100);
                     return (
                       <tr key={`biz_inv_desk_${inv.id}_${idx}`} className="hover:bg-kite-bg transition-colors group">
                         <td className="py-4 pl-5 pr-4 text-kite-text font-medium whitespace-nowrap uppercase">{investor?.name?.toUpperCase() || "UNKNOWN"}</td>
                         <td className={`py-4 px-4 text-right font-mono font-medium ${isCompleted ? 'text-kite-blue' : 'text-kite-text'}`}>{formatCompactZerodha(inv.amount)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-kite-text-light">{formatCompactZerodha(ownerProfit)}</td>
                         <td className="py-4 px-4 text-right font-mono font-medium text-[#4CAF50]">
                           {isCompleted ? "-" : `${liveProfit >= 0 ? "+" : ""}${formatCompactZerodha(liveProfit)}`}
                         </td>
                         <td className="py-4 px-4 text-center text-kite-text-light">{inv.timePeriodMonths} Months</td>
                         <td className="py-4 pr-5 pl-4 text-right">
                           <span className={inv.status === "active" ? "text-[#4CAF50] uppercase text-[11px] font-medium tracking-wider" : "text-kite-text-light uppercase text-[11px] font-medium tracking-wider"}>
                             {inv.status}
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
                 const profit = (inv.amount * (business.interestRate || 0)) / 100;
                 return (
                   <div key={`biz_inv_mob_${inv.id}_${idx}`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{investor?.name || "Unknown"}</p>
                        <p className="text-[12px] md:text-[13px] text-kite-text-light mt-0.5">{inv.timePeriodMonths} Months • <span className={inv.status === "active" ? "text-[#4CAF50]" : "text-kite-text-light"}>{inv.status}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(inv.amount).replace("₹", "")}</p>
                        <p className="text-[12px] md:text-[13px] font-medium text-[#4CAF50] mt-0.5">+{formatINR(profit).replace("₹", "")}</p>
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
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text font-mono tracking-wider">{business.bankDetails.accountNumber}</p>
                </div>
                <div className="border-b border-kite-border-soft pb-4">
                  <p className="text-[11px] md:text-[12px] text-kite-text-light uppercase tracking-wide font-normal mb-1">IFSC</p>
                  <p className="text-[14px] md:text-[15px] font-normal text-kite-text font-mono tracking-wider">{business.bankDetails.ifscCode}</p>
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
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[14px] font-medium text-red-800 dark:text-red-400">Permanent Business Delete</h4>
                    <p className="text-[12px] md:text-[13px] text-red-600/80 dark:text-red-400/80 mt-1 leading-relaxed">
                      This action will permanently delete this business. Any investors who have invested in this business will have their invested amount refunded to their bank account balance immediately. All records of this business will be permanently destroyed.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[13px] font-medium rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Business
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center px-4 max-w-sm mx-auto h-full my-auto pb-20">
              <div className={`w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 ${isDeleting ? "animate-pulse" : ""}`}>
                <Trash2 className={`w-8 h-8 text-red-500 ${isDeleting ? "animate-bounce" : ""}`} />
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
                  className="w-full py-2.5 bg-transparent border border-kite-border text-kite-text text-[14px] font-medium rounded hover:bg-gray-50 dark:hover:bg-kite-border-soft transition-colors disabled:opacity-50"
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
                  <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Trigger Amount (₹)</label>
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
                    <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Min Quantity</label>
                    <input
                      type="number"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={triggerConfig.minQuantity}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, minQuantity: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Max Quantity</label>
                    <input
                      type="number"
                      className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
                      value={triggerConfig.maxQuantity}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, maxQuantity: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSaveTrigger} 
            className={`w-full py-3 rounded text-[14px] md:text-[15px] font-normal mt-4 transition-all duration-300 flex items-center justify-center ${showSuccess ? 'bg-kite-blue text-white' : 'bg-[#4CAF50] text-white'}`}
          >
            {showSuccess ? (
              <span className="flex items-center space-x-2 animate-fade-in">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Trigger Settings Saved</span>
              </span>
            ) : (
              "Save Settings"
            )}
          </button>

          <div className="pt-6 mt-6 border-t border-kite-border-soft">
            <button 
              onClick={() => setCurrentView("trigger-history")}
              className="w-full py-3 bg-white dark:bg-transparent border border-kite-border-hard text-kite-text hover:bg-gray-50 dark:hover:bg-kite-border-soft transition-colors rounded text-[14px] md:text-[15px] font-normal flex items-center justify-between px-4"
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
                      <div className="mt-2 text-[13px] text-kite-text-light font-mono bg-[#F8F9FA] dark:bg-kite-bg p-2 rounded truncate border border-kite-border-soft">
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
