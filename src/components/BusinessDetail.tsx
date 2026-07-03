import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../utils/AppContext";
import { formatINR } from "../utils/mockData";
import {
  ArrowLeft,
  Upload,
  ChevronRight,
  Info
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

export default function BusinessDetail({
  businessId,
  onBack,
  onDelete,
}: Props) {
  const { state, dispatch } = useAppContext();
  const business = state.businesses.find((b) => b.id === businessId);
  const [currentView, setCurrentView] = useState<"menu" | "funds" | "profile" | "investors" | "bank" | "registration">("menu");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useMobileBackNavigation(currentView !== "menu", () => setCurrentView("menu"));

  
  const [formData, setFormData] = useState({
    fundingRequired: business?.fundingRequired ? new Intl.NumberFormat('en-IN').format(business.fundingRequired) : "0",
    interestRate: business?.interestRate.toString() || "0",
    status: business?.status || "listed",
    name: business?.name || "",
    description: business?.description || "",
    location: business?.location || "",
    photoUrl: business?.photoUrl || "",
  });

  useEffect(() => {
    if (business) {
      setFormData({
        fundingRequired: new Intl.NumberFormat('en-IN').format(business.fundingRequired || 0),
        interestRate: (business.interestRate || 0).toString(),
        status: business.status || "listed",
        name: business.name || "",
        description: business.description || "",
        location: business.location || "",
        photoUrl: business.photoUrl || "",
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
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        photoUrl: formData.photoUrl,
      },
    });
    setCurrentView("menu");
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
        </h1>
      </div>

      {currentView === "menu" && (
        <div className="bg-white dark:bg-kite-surface flex-1">
          <div className="px-5 py-6 flex justify-between items-center border-b border-kite-border-soft">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-normal text-kite-text mb-1 tracking-wide uppercase">{business.name || "BUSINESS NAME"}</h2>
              <p className="text-[12px] md:text-[13px] text-kite-text-light tracking-widest">{business.ownerName || "Owner Name"}</p>
              <p className="text-[12px] md:text-[13px] text-kite-text-light mt-1">{business.businessId || "ID Number"}</p>
            </div>
            <div className="relative cursor-pointer shrink-0 ml-4" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft relative group">
                {business.photoUrl ? (
                  <img src={business.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl md:text-3xl font-normal">{business.name?.substring(0, 2).toUpperCase() || "BU"}</span>
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
             <label className="block text-[11px] md:text-[12px] font-normal mb-1 text-kite-text-light uppercase">Description</label>
             <textarea
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none resize-none h-16"
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
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
          <div className="bg-white dark:bg-kite-surface mb-2 py-4 px-5 border-b border-kite-border-soft flex justify-between items-center">
             <p className="text-[13px] md:text-[14px] text-kite-text font-normal">Investors</p>
             <p className="text-[18px] md:text-[20px] font-normal text-kite-text">{activeBusinessInvestments.length}</p>
          </div>
          
          <div className="bg-white dark:bg-kite-surface pt-2 border-b border-kite-border-soft mt-4">
             <h3 className="px-5 py-3 text-[14px] font-normal text-kite-text-light border-b border-kite-border-soft uppercase tracking-wider">Current investor</h3>
             <div className="divide-y divide-kite-border-soft">
               {businessInvestments.map((inv, idx) => {
                 const investor = state.investors.find(i => i.id === inv.investorId);
                 return (
                   <div key={`biz_inv_${inv.id}_${idx}`} className="p-4 flex justify-between items-center px-5">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{investor?.name || "Unknown"}</p>
                        <p className="text-[12px] md:text-[13px] text-kite-text-light mt-0.5">{inv.timePeriodMonths} Months • <span className={inv.status === "active" ? "text-[#4CAF50]" : "text-kite-text-light"}>{inv.status}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] md:text-[15px] font-normal text-kite-text">{formatINR(inv.amount).replace("₹", "")}</p>
                      </div>
                   </div>
                 )
               })}
               {businessInvestments.length === 0 && (
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
