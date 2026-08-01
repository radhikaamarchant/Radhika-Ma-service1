import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import ImageCropModal from "./ImageCropModal";
import { useAppContext } from '../utils/AppContext';
import BioMentionEditor from './BioMentionEditor';
import BioRenderer from './BioRenderer';
import InvestorPreviewModal from './InvestorPreviewModal';
import BusinessPreviewModal from './BusinessPreviewModal';
import { Investor, Investment, Business } from "../types";
import { formatINR } from "../utils/mockData";
import { LivePortfolioDetail } from "./LivePortfolioDetail";
import {
  getUnifiedBankBalance,
  getUnifiedTransactions,
} from "../utils/bankBalance";

const formatCompactZerodha = (num: number) => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  let formatted = "";
  if (absNum >= 10000000) {
    formatted = (absNum / 10000000).toFixed(2).replace(/\.00$/, "") + "CR";
  } else if (absNum >= 100000) {
    formatted = (absNum / 100000).toFixed(2).replace(/\.00$/, "") + "L";
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(2).replace(/\.00$/, "") + "K";
  } else {
    formatted = absNum.toFixed(2).replace(/\.00$/, "");
  }
  return (num < 0 ? "-" : "") + formatted;
};

const toTitleCase = (str: string | undefined) => {
  if (!str) return "";
  return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};

import {
  ArrowLeft,
  User,
  Save,
  Camera,
  Eye,
  Trash2,
  X,
  Edit2,
  Wallet,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  TrendingUp,
  ChevronRight,
  Search,
  Landmark,
  ChevronDown,
} from "lucide-react";
import { calculateLiveProfit } from "../utils/profitCalculator";
import { INDIAN_CITIES } from "../utils/indianCities";
import { useMarketSimulation } from "../utils/MarketSimulationContext";
import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";
interface InvestorDetailProps {
  investorId: string;
  onBack: () => void;
  onWithdraw?: (investments: any[]) => void;
  onBuyClick?: (investment: any) => void;
}

const InvestorInvestmentRowDesktop = React.memo(({ inv, business, duration, onClick, marketTrends }: any) => {
  const trend = marketTrends[inv.businessId] || 0;
  const isCompleted = inv.status === "completed";
  const pnl = isCompleted
    ? (inv.payoutDetails?.totalCredited || inv.amount) +
      (inv.payoutDetails?.rmasCommission || 0) +
      (inv.payoutDetails?.happyIncomeTax || 0) -
      inv.amount
    : inv.amount * (trend / 100);
  const pnlPct = isCompleted
    ? (pnl / inv.amount) * 100
    : trend;

  const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;
  
  return (
    <tr
      className="hover:bg-kite-bg transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="!py-[10px] !px-[12px] font-medium whitespace-nowrap !text-[13px] capitalize text-[#444444] dark:text-[#BBBBBB]">
        {business?.name?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
      </td>
      <td className="!py-[10px] !px-[12px] text-right font-mono font-medium !text-[13px] text-[#444444] dark:text-[#BBBBBB]">
        {formatCompactZerodha(inv.amount)}
      </td>
      <td
        className={`!py-[10px] !px-[12px] text-right font-mono font-medium !text-[13px] ${
          pnl >= 0
            ? "text-[#4CAF50] dark:text-[#5B9A5D]"
            : "text-[#FF5722] dark:text-[#D4603B]"
        }`}
      >
        {pnl >= 0 ? "+" : ""}
        {formatCompactZerodha(pnl)}
      </td>
      <td
        className={`!py-[10px] !px-[12px] text-right font-mono font-medium !text-[13px] ${
          pnlPct >= 0
            ? "text-[#4CAF50] dark:text-[#5B9A5D]"
            : "text-[#FF5722] dark:text-[#D4603B]"
        }`}
      >
        {pnlPct >= 0 ? "+" : ""}
        {pnlPct.toFixed(2)}%
      </td>
      <td className="!py-[10px] !px-[12px] text-center text-[#444444] dark:text-[#BBBBBB] !text-[13px]">
        {qty}
      </td>
      <td className="!py-[10px] !px-[12px] text-right text-kite-text-light font-medium !text-[13px]">
        <span className={inv.status === "active" ? "text-[#FF5722] dark:text-[#D4603B] capitalize font-medium tracking-wider" : "text-[#4CAF50] dark:text-[#5B9A5D] capitalize font-medium tracking-wider"}>
          {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
        </span>
      </td>
    </tr>
  );
});

const InvestorInvestmentRowMobile = React.memo(({ inv, business, duration, onClick, marketTrends }: any) => {
  const trend = marketTrends[inv.businessId] || 0;
  const isCompleted = inv.status === "completed";
  const pnl = isCompleted
    ? (inv.payoutDetails?.totalCredited || inv.amount) +
      (inv.payoutDetails?.rmasCommission || 0) +
      (inv.payoutDetails?.happyIncomeTax || 0) -
      inv.amount
    : inv.amount * (trend / 100);
  const pnlPct = isCompleted
    ? (pnl / inv.amount) * 100
    : trend;

  const qty = Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0;

  return (
    <div
      className="p-3 hover:bg-kite-bg cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-[#444444] dark:text-[#BBBBBB] capitalize text-[13px]">
          {business?.name?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
        </span>
        <span className="font-mono text-[13px] font-medium text-[#444444] dark:text-[#BBBBBB]">
          {formatCompactZerodha(inv.amount)}
        </span>
      </div>
      <div className="flex justify-between items-end mt-1">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[11px] text-kite-text-light font-medium tracking-wider uppercase">
             {qty} QTY
          </span>
          <span className={inv.status === "active" ? "text-[11px] font-medium tracking-wider uppercase text-[#FF5722] dark:text-[#D4603B]" : "text-[11px] font-medium tracking-wider uppercase text-[#4CAF50] dark:text-[#5B9A5D]"}>
            {inv.status === "active" ? "Holding" : (inv.status === "completed" ? "Pay Out" : inv.status)}
          </span>
        </div>
        <div className="text-right flex flex-col items-end gap-[2px]">
          <span
            className={`font-mono text-[13px] font-medium ${
              pnl >= 0
                ? "text-[#4CAF50] dark:text-[#5B9A5D]"
                : "text-[#FF5722] dark:text-[#D4603B]"
            }`}
          >
            {pnl >= 0 ? "+" : ""}
            {formatCompactZerodha(pnl)}
          </span>
        </div>
      </div>
    </div>
  );

});

export default function InvestorDetail({
  investorId,
  onBack,
  onWithdraw,
  onBuyClick,
}: InvestorDetailProps) {
  const { state, dispatch } = useAppContext();
  const { marketState } = useMarketSimulation();
  
  useEffect(() => {
    document.body.classList.add("investor-detail-open");
    return () => document.body.classList.remove("investor-detail-open");
  }, []);

  const investor = state.investors.find((i) => i.id === investorId);
  if (!investor) return null;
  const investorInvestments = state.investments
    .filter((inv) => inv.investorId === investorId)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  const [investmentSearch, setInvestmentSearch] = useState("");

  const filteredInvestments = useMemo(() => investorInvestments.filter((inv) => {
    if (!investmentSearch.trim()) return true;
    const business = state.businesses.find((b) => b.id === inv.businessId);
    return business?.name?.toLowerCase().includes(investmentSearch.toLowerCase());
  }), [investorInvestments, investmentSearch, state.businesses]);

  const activeInvestments = investorInvestments.filter(
    (inv) => inv.status === "active",
  );
  const totalAmountInvested = activeInvestments.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );
  let totalLiveProfit = 0;
  const grouped = activeInvestments.reduce(
    (acc, inv) => {
      if (!acc[inv.businessId]) acc[inv.businessId] = [];
      acc[inv.businessId].push(inv);
      return acc;
    },
    {} as Record<string, Investment[]>,
  );
  Object.entries(grouped).forEach(([bizId, invs]) => {
    const res = calculateLiveProfit(
      invs as Investment[],
      bizId,
      marketState.trends,
      state.settings,
      state.businesses
    );
    totalLiveProfit += res.liveProfit;
  });
  const returnsEarned = investorInvestments
    .filter((inv) => inv.status === "completed")
    .reduce((acc, inv) => acc + (inv.interestEarned || 0), 0);
  const unifiedBalance = investor
    ? getUnifiedBankBalance(
        investor.name,
        state.businesses,
        state.investors,
        state.investments,
        state.settings,
      )
    : 0;
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isBankDetailsExpanded, setIsBankDetailsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<"profile" | "statement" | "funds">("profile");
  const [statementSearch, setStatementSearch] = useState("");
  const [fundAction, setFundAction] = useState<"add" | "withdraw" | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  
  const unifiedBankTransactions = investor ? getUnifiedTransactions(
    investor.name,
    state.businesses,
    state.investors,
    state.investments,
    state.settings
  ) : [];
  
  const filteredBankTransactions = unifiedBankTransactions.filter(tx => 
    tx.title.toLowerCase().includes(statementSearch.toLowerCase()) || 
    tx.description.toLowerCase().includes(statementSearch.toLowerCase()) ||
    tx.amount.toString().includes(statementSearch) ||
    new Date(tx.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toLowerCase().includes(statementSearch.toLowerCase())
  );



  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [selectedPreviewInvestor, setSelectedPreviewInvestor] = useState<Investor | null>(null);
  const [previewHistory, setPreviewHistory] = useState<Investor[]>([]);
  const [selectedPreviewBusiness, setSelectedPreviewBusiness] = useState<Business | null>(null);
  const [previewBusinessHistory, setPreviewBusinessHistory] = useState<Business[]>([]);



  const [selectedPortfolioInvestment, setSelectedPortfolioInvestment] =
    useState<any>(null);
  useMobileBackNavigation(isEditingDetails, () => setIsEditingDetails(false));
  useMobileBackNavigation(!!selectedPortfolioInvestment, () => setSelectedPortfolioInvestment(null));

  const [formData, setFormData] = useState({
    name: investor?.name || "",
    bio: investor?.bio || "",
    address: {
      flatHouse: investor?.address?.flatHouse || "",
      residentHouseName: investor?.address?.residentHouseName || "",
      landmark: investor?.address?.landmark || "",
      city: investor?.address?.city || "",
      state: investor?.address?.state || "",
    },
    bankName: investor?.bankDetails?.bankName || "",
    accountNumber: investor?.bankDetails?.accountNumber || "",
    ifscCode: investor?.bankDetails?.ifscCode || "",
    accountHolderName: investor?.bankDetails?.accountHolderName || "",
    photoUrl: investor?.photoUrl || "",
  });

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objUrl = URL.createObjectURL(file);
      setCropImageUrl(objUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    setFormData({ ...formData, photoUrl: croppedUrl });
    // Also save directly if we want, or wait for save button
    // Let's save directly to investor object for immediate effect
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        photoUrl: croppedUrl,
      },
    });
    setCropImageUrl(null);
  };

  const handleDeletePhoto = () => {
    setFormData({ ...formData, photoUrl: "" });
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        photoUrl: "",
      },
    });
    setShowPhotoMenu(false);
  };

  const handleSaveDetails = () => {
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        name: formData.name,
        bio: formData.bio,
        address: formData.address,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        },
        photoUrl: formData.photoUrl,
      },
    });
    setIsEditingDetails(false);
  };
  const handleDeleteInvestor = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteInvestor = () => {
    dispatch({ type: "DELETE_INVESTOR", payload: investorId });
    setShowDeleteConfirm(false);
    onBack();
  };
  return (
    <>
    {currentView === "profile" && (
    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-16 md:pt-4 px-3 md:px-0 w-full">

      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onClose={() => setCropImageUrl(null)}
          onCrop={handleCropComplete}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white dark:bg-kite-bg p-6 rounded-md max-w-sm w-full">
            <h3 className="text-[16px] font-medium text-kite-text mb-2">Delete Investor</h3>
            <p className="text-[14px] text-kite-text-light mb-6">Are you sure you want to permanently delete this investor and all of their investments? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium text-kite-text border border-kite-border rounded-sm hover:bg-kite-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-[13px] font-medium text-white bg-kite-red rounded-sm hover:bg-opacity-90 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {""}
      {/* Desktop Header */}
      <div className="hidden md:flex items-center px-4 py-3 bg-white dark:bg-[#181818] border-b border-kite-border mb-6 -mt-4 shrink-0 w-full">
        <button
          onClick={onBack}
          className="flex items-center text-kite-text-light hover:text-kite-blue transition-colors mr-3 p-1 -ml-1 rounded-full hover:bg-kite-bg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
          Investor Profile
        </h2>
      </div>

      {/* Header */}
      {""}
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="flex items-start space-x-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 mt-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center md:hidden"
          >
            {" "}
            <ArrowLeft className="w-5 h-5" />{" "}
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className="relative shrink-0">
            <div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft relative group cursor-pointer"
              onClick={() => {
                if (investor.photoUrl) {
                  setShowPhotoMenu(!showPhotoMenu);
                } else {
                  fileInputRef.current?.click();
                }
              }}
            >
              {investor.photoUrl ? (
                <img src={investor.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl md:text-3xl font-normal">{(investor.shortName || investor.name)?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            
            {showPhotoMenu && investor.photoUrl && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPhotoMenu(false)}></div>
                <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-40 bg-white dark:bg-kite-surface shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-kite-border rounded-[12px] overflow-hidden z-50 py-0.5">
                  <button 
                    onClick={() => { setShowPhotoMenu(false); setShowPhotoPreview(true); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-[13px] md:text-[14px] font-medium text-kite-text hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors"
                  >
                    <Eye className="w-[18px] h-[18px] text-kite-text-light" />
                    <span>View Photo</span>
                  </button>
                  <button 
                    onClick={() => { setShowPhotoMenu(false); fileInputRef.current?.click(); }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-[13px] md:text-[14px] font-medium text-kite-text hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors border-t border-kite-border"
                  >
                    <Camera className="w-[18px] h-[18px] text-kite-text-light" />
                    <span>Upload New</span>
                  </button>
                  <button 
                    onClick={handleDeletePhoto}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-[13px] md:text-[14px] font-medium text-[#DF514C] dark:text-[#E25F5B] hover:bg-kite-bg dark:md:hover:bg-[#131415] transition-colors border-t border-kite-border"
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                    <span>Remove</span>
                  </button>
                </div>
              </>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex flex-col">
                <h2 className="text-[15px] md:text-[16px] font-medium text-kite-text">
                  {toTitleCase(investor.name)}
                </h2>
                <span
                  className="text-[11px] md:text-[12px] text-kite-text-light tracking-wide"
                >
                  #{investor.investorId}
                </span>
              </div>
            </div>
            
            {investor.bio && (
              <p className="mt-4 text-[12px] md:text-[13px] text-kite-text whitespace-pre-wrap leading-relaxed max-w-2xl">
                <BioRenderer 
                  bio={investor.bio} 
                  onMentionClick={(type, id, data) => {
                    if (type === 'investor') {
                      setPreviewHistory([data]);
                      setSelectedPreviewInvestor(data);
                    } else if (type === 'business') {
                      setPreviewBusinessHistory([data]);
                      setSelectedPreviewBusiness(data);
                    }
                  }} 
                />
              </p>
            )}
            {investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
              <div className="mt-3 text-[11px] md:text-[12px] text-kite-text-light flex flex-col space-y-0.5">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {""}
      {isEditingDetails ? (
        <div className="bg-white dark:bg-kite-surface border border-kite-border rounded-sm p-4 md:p-6 animate-fade-in">
          <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text mb-4 pb-2 border-b border-kite-border">
            Edit Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Investor Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Bio
              </label>
              <BioMentionEditor
                value={formData.bio || ''}
                onChange={(val) => setFormData({ ...formData, bio: val })}
              />
            </div>
            <div className="md:col-span-2 pt-4 pb-2">
              <h4 className="text-[11px] md:text-[12px] font-medium text-kite-text uppercase tracking-wider border-b border-kite-border pb-2">
                Address Details
              </h4>
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Flat / House No.
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.flatHouse}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, flatHouse: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Resident / House Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: e.target.value } })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Circle & Landmark
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: e.target.value } })
                }
              />
            </div>
            <div className="relative">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-kite-border rounded-sm px-3 py-2 pr-8 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                  value={showCityDropdown ? citySearch : formData.address.city}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (!showCityDropdown) setShowCityDropdown(true);
                  }}
                  onFocus={() => {
                    setCitySearch("");
                    setShowCityDropdown(true);
                  }}
                  onBlur={() => {
                    // Small delay to allow clicking on dropdown
                    setTimeout(() => setShowCityDropdown(false), 200);
                  }}
                  placeholder="Search city..."
                />
                <Search className="absolute right-2 top-2.5 w-4 h-4 text-kite-text-light pointer-events-none" />
              </div>
              
              {showCityDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-kite-surface border border-kite-border rounded-sm shadow-lg max-h-60 overflow-y-auto">
                  {INDIAN_CITIES.filter((c) =>
                    c.city.toLowerCase().includes(citySearch.toLowerCase())
                  ).slice(0, 50).map((c, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 hover:bg-kite-bg cursor-pointer text-[13px] md:text-[14px] border-b border-kite-border last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents onBlur from firing before onClick
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: c.city, state: c.state }
                        });
                        setCitySearch("");
                        setShowCityDropdown(false);
                      }}
                    >
                      <span className="font-medium">{c.city}</span>
                      <span className="text-kite-text-light text-[11px] md:text-[12px] ml-2 block sm:inline">{c.state}</span>
                    </div>
                  ))}
                  {INDIAN_CITIES.filter((c) =>
                    c.city.toLowerCase().includes(citySearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-[13px] md:text-[14px] text-kite-text-light">
                      No city found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                State
              </label>
              <input
                type="text"
                disabled
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-kite-bg dark:bg-kite-surface text-[13px] md:text-[14px] font-medium text-kite-text outline-none cursor-not-allowed opacity-70"
                value={formData.address.state}
              />
            </div>
            <div className="md:col-span-2 pt-4 pb-2">
              <h4 className="text-[11px] md:text-[12px] font-medium text-kite-text uppercase tracking-wider">
                Bank Details
              </h4>
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                IFSC Code
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.ifscCode}
                onChange={(e) =>
                  setFormData({ ...formData, ifscCode: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Account Holder Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountHolderName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-8 border-t border-kite-border pt-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <button
              onClick={handleDeleteInvestor}
              className="w-full sm:w-auto bg-white dark:bg-kite-surface text-[#DF514C] dark:text-[#E25F5B] border border-red-200 hover:bg-red-50 hover:border-red-300 font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors text-center"
            >
              {""}
              Delete Investor{""}
            </button>
            <div className="flex space-x-2 w-full sm:w-auto justify-end flex-1">
              <button
                onClick={() => setIsEditingDetails(false)}
                className="flex-1 sm:flex-none text-center bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors"
              >
                {""}
                Cancel{""}
              </button>
              <button
                onClick={handleSaveDetails}
                className="flex-1 sm:flex-none text-center bg-kite-blue hover:bg-opacity-90 text-white font-medium text-[13px] md:text-[14px] px-4 py-2 rounded-sm transition-colors shadow-sm"
              >
                {""}
                Save Changes{""}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {""}
          {/* Action Buttons */}
          {""}
          <div className="flex flex-col sm:flex-row gap-3">
            {""}
            {onWithdraw && activeInvestments.length > 0 && (
              <button
                onClick={onWithdraw}
                className="flex-1 bg-kite-blue text-white hover:bg-opacity-90 font-medium text-[13px] md:text-[14px] px-4 py-3 sm:py-2.5 rounded-sm shadow-sm transition-all flex items-center justify-center"
              >
                {""}
                Portfolio{""}
              </button>
            )}
            {""}
            <button
              onClick={() => setIsEditingDetails(true)}
              className="w-full sm:w-auto sm:ml-auto bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[12px] md:text-[13px] px-3 py-2 rounded-sm shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> <span>Edit Details</span>
            </button>
          </div>
          {""}
          {/* Stats Grid */}
          {""}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded-sm p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Equity Amount (₹)
              </p>
              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                {formatINR(totalAmountInvested)}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Avail Investing
              </p>
              <p className="text-[13px] md:text-[14px] font-medium text-kite-text">
                {activeInvestments.length}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Margin (₹)
              </p>
              <p className={`text-[13px] md:text-[14px] font-medium ${totalLiveProfit >= 0 ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-[#DF514C] dark:text-[#E25F5B]"}`}>
                {totalLiveProfit >= 0 ? "+" : "-"}{formatINR(Math.abs(totalLiveProfit))}
              </p>
            </div>
            <div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-3 md:p-4">
              <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase tracking-wider mb-1">
                Demat balance
              </p>
              <p
                className={`text-[13px] md:text-[14px] font-medium ${unifiedBalance >= 0 ? "text-kite-blue" : "text-[#DF514C] dark:text-[#E25F5B]"}`}
              >
                {""}
                {unifiedBalance >= 0 ? "" : "-"}
                {formatINR(Math.abs(unifiedBalance))}
                {""}
              </p>
            </div>
          </div>
          {""}
          {/* Bank Profile */}
          {""}
          <div className="bg-white dark:bg-kite-surface border border-kite-border rounded overflow-hidden">
            <div 
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-kite-bg transition-colors ${isBankDetailsExpanded ? 'border-b border-kite-border' : ''}`}
              onClick={() => setIsBankDetailsExpanded(!isBankDetailsExpanded)}
            >
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-kite-text-light" />
                <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                  Bank Profile
                </h3>
              </div>
              {isBankDetailsExpanded ? (
                <ChevronDown className="w-4 h-4 text-kite-text-light" />
              ) : (
                <ChevronRight className="w-4 h-4 text-kite-text-light" />
              )}
            </div>
            {""}
            {isBankDetailsExpanded && (
              <div className="p-4">
                {investor.bankDetails ? (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Bank Name
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                        {investor.bankDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Account No.
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                        {investor.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        IFSC Code
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                        {investor.bankDetails.ifscCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Holder Name
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                        {investor.bankDetails.accountHolderName}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end border-t border-kite-border-soft pt-4">
                    <button onClick={() => setCurrentView("funds")} className="flex items-center gap-1.5 px-4 py-1.5 border border-kite-blue text-kite-blue rounded text-[13px] hover:bg-kite-blue hover:text-white transition-colors">
                      <span className="w-2.5 h-2.5 border-2 border-current rounded-full inline-block"></span> Funds & Statement
                    </button>
                  </div>
                  </>
                ) : (
                  <p className="text-[13px] md:text-[14px] text-kite-text-light py-2">
                    No bank details added.
                  </p>
                )}
              </div>
            )}
            {""}
          </div>
          {""}
          {/* Investment History */}
          {""}
          <div className="bg-white dark:bg-kite-surface border border-kite-border rounded overflow-hidden">
            <div className="p-4 border-b border-kite-border flex justify-between items-center">
              <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                Investment History
              </h3>
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-kite-text-light" />
                <input
                  type="text"
                  placeholder="Search investments"
                  value={investmentSearch}
                  onChange={(e) => setInvestmentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-[220px] text-[12px] bg-kite-bg border border-kite-border rounded-[4px] outline-none focus:border-kite-blue focus:ring-1 focus:ring-kite-blue/20 transition-all text-kite-text dark:text-[#E3E3E3]"
                />
              </div>
            </div>
            {""}
            {/* Desktop Table */}
            {""}
            <div className="hidden md:block overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-[13px] md:text-[14px]">
                <thead className="bg-kite-bg dark:bg-kite-bg sticky top-0 z-10">
                  <tr className="text-[11px] md:text-[12px] uppercase tracking-wider text-kite-text-light">
                    <th className="p-3 font-medium border-b border-kite-border">
                      Market
                    </th>
                    <th className="p-3 font-medium text-right border-b border-kite-border">
                      Equity (₹)
                    </th>
                    <th className="p-3 font-medium text-center border-b border-kite-border">
                      Qty
                    </th>
                    <th className="p-3 font-medium text-center border-b border-kite-border">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kite-border relative">
                  {""}
                  {filteredInvestments.map((inv, idx) => {
                    const business = state.businesses.find(
                      (b) => b.id === inv.businessId,
                    );
                    const duration = Math.ceil(
                      (new Date().getTime() -
                        new Date(inv.startDate).getTime()) /
                        (1000 * 3600 * 24),
                    );
                    return (
                      <tr
                        key={`desk_inv_det_${inv.id}_${idx}`}
                        className="hover:bg-kite-bg transition-colors cursor-pointer"
                        onClick={() => {
                          const bizInvs = investorInvestments.filter(
                            (i) => i.businessId === inv.businessId && i.status === inv.status,
                          );
                          setSelectedPortfolioInvestment({
                            businessId: inv.businessId,
                            investorId: investor.id,
                            status: inv.status,
                            timePeriodMonths: bizInvs[0].timePeriodMonths,
                            interestRate: bizInvs[0].interestRate,
                            startDate: bizInvs[0].startDate,
                            endDate: bizInvs[0].endDate,
                            amount: bizInvs.reduce(
                              (acc, i) => acc + i.amount,
                              0,
                            ),
                            groupedInvestmentsList: bizInvs,
                          });
                        }}
                      >
                        <td className="p-3 font-medium text-kite-text">
                          {toTitleCase(business?.name) || "Unknown"}
                        </td>
                        <td className={`p-3 font-medium text-right ${inv.status === "completed" ? "text-[#4184F3]" : ""}`}>
                          {formatINR(inv.amount)}
                        </td>
                        <td className="p-3 text-kite-text-light text-center">
                          {Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] md:text-[11px] font-medium uppercase tracking-wider ${inv.status === "active" ? "bg-kite-green/10 text-[#4CAF50] dark:text-[#5B9A5D]" : inv.status === "completed" ? "bg-kite-blue/10 text-kite-blue" : "bg-kite-border text-kite-text-light"}`}
                          >
                            {""}
                            {inv.status === "active" ? "Available" : inv.status === "completed" ? "Closed" : inv.status}
                            {""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {""}
                  {investorInvestments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-kite-text-light text-[11px] md:text-[12px]"
                      >
                        No investment history.
                      </td>
                    </tr>
                  )}
                  {""}
                </tbody>
              </table>
            </div>
            {""}
            {/* Mobile Rows */}
            {""}
            <div className="block md:hidden divide-y divide-kite-border">
              {""}
              {investorInvestments.map((inv, idx) => {
                const business = state.businesses.find(
                  (b) => b.id === inv.businessId,
                );
                const duration = Math.ceil(
                  (new Date().getTime() - new Date(inv.startDate).getTime()) /
                    (1000 * 3600 * 24),
                );
                return (
                  <div
                    key={`mob_inv_det_${inv.id}_${idx}`}
                    className="p-3 hover:bg-kite-bg cursor-pointer"
                    onClick={() => {
                      const bizInvs = investorInvestments.filter(
                        (i) => i.businessId === inv.businessId,
                      );
                      setSelectedPortfolioInvestment({
                        businessId: inv.businessId,
                        investorId: investor.id,
                        status: "active",
                        timePeriodMonths: bizInvs[0].timePeriodMonths,
                        interestRate: bizInvs[0].interestRate,
                        startDate: bizInvs[0].startDate,
                        endDate: bizInvs[0].endDate,
                        amount: bizInvs.reduce((acc, i) => acc + i.amount, 0),
                        groupedInvestmentsList: bizInvs,
                      });
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-[13px] md:text-[14px] text-kite-text">
                        {toTitleCase(business?.name) || "Unknown"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-medium uppercase tracking-wider ${inv.status === "active" ? "bg-kite-green/10 text-[#4CAF50] dark:text-[#5B9A5D]" : inv.status === "completed" ? "bg-kite-blue/10 text-kite-blue" : "bg-kite-border text-kite-text-light"}`}
                      >
                        {""}
                        {inv.status === "active" ? "Available" : inv.status === "completed" ? "Closed" : inv.status}
                        {""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] md:text-[12px]">
                      <div className="flex flex-col">
                        <span className="text-kite-text-light">Equity (₹)</span>
                        <span className="font-medium text-kite-text">
                          {formatINR(inv.amount)}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-kite-text-light">Qty</span>
                        <span className="font-medium text-kite-text">
                          {Number(inv.quantity) || (business?.triggerAmount ? Math.floor(inv.amount / business.triggerAmount) : Math.floor(inv.amount / 100)) || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {""}
              {investorInvestments.length === 0 && (
                <div className="p-6 text-center text-kite-text-light text-[13px] md:text-[14px]">
                  No investment history.
                </div>
              )}
              {""}
            </div>
          </div>
        </>
      )}
      {""}
      {selectedPortfolioInvestment && createPortal(<LivePortfolioDetail
          selectedInvestment={selectedPortfolioInvestment}
          onClose={() => setSelectedPortfolioInvestment(null)}
          onSellClick={onWithdraw}
          onBuyClick={onBuyClick}
        />, document.body)}
      {showPhotoPreview && investor.photoUrl && (
        <div className="fixed inset-0 z-[110] bg-black md:bg-black/80 flex flex-col md:items-center md:justify-center md:p-8">
          <div className="flex justify-between items-center p-4 bg-black text-white mobile-modal-safe w-full shrink-0 md:hidden">
            <span className="font-medium text-[16px]">Profile Photo</span>
            <button onClick={() => setShowPhotoPreview(false)} className="px-3 py-1 font-normal text-[15px]">Close</button>
          </div>
          
          <div className="flex-1 md:flex-initial md:bg-white md:dark:bg-kite-surface md:rounded-lg md:overflow-hidden md:flex md:flex-col md:w-full md:max-w-xl md:shadow-2xl flex flex-col w-full h-full md:h-auto">
            <div className="hidden md:flex justify-between items-center p-4 border-b border-kite-border bg-white dark:bg-kite-surface text-kite-text shrink-0">
              <span className="font-medium text-[16px]">Profile Photo</span>
              <button onClick={() => setShowPhotoPreview(false)} className="p-1 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full transition-colors">
                <X className="w-5 h-5 text-kite-text-light" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-black md:bg-gray-100 md:dark:bg-black p-0 md:p-8 relative">
              <img src={investor.photoUrl} alt="Profile Preview" className="w-full h-auto max-h-[80vh] md:max-h-[60vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {selectedPreviewInvestor && (
        <>
        <InvestorPreviewModal
          investor={selectedPreviewInvestor}
          onClose={() => {
            setPreviewHistory(prev => {
              if (prev.length <= 1) {
                setSelectedPreviewInvestor(null);
                return [];
              }
              const newHistory = prev.slice(0, -1);
              setSelectedPreviewInvestor(newHistory[newHistory.length - 1]);
              return newHistory;
            });
          }}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setPreviewHistory(prev => [...prev, data]);
              setSelectedPreviewInvestor(data);
            } else if (type === 'business') {
              setPreviewBusinessHistory(prev => [...prev, data]);
              setSelectedPreviewBusiness(data);
            }
          }}
        />
        {selectedPreviewBusiness && (
        <BusinessPreviewModal
          business={selectedPreviewBusiness}
          onClose={() => {
            setPreviewBusinessHistory(prev => {
              if (prev.length <= 1) {
                setSelectedPreviewBusiness(null);
                return [];
              }
              const newHistory = prev.slice(0, -1);
              setSelectedPreviewBusiness(newHistory[newHistory.length - 1]);
              return newHistory;
            });
          }}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setPreviewHistory(prev => [...prev, data]);
              setSelectedPreviewInvestor(data);
            } else if (type === 'business') {
              setPreviewBusinessHistory(prev => [...prev, data]);
              setSelectedPreviewBusiness(data);
            }
          }}
        />
        )}
        </>
      )}
    </div>
    )}
    
  {currentView === "funds" && (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 pt-16 md:pt-4 px-3 md:px-0 w-full bg-white dark:bg-kite-surface min-h-[calc(100vh-64px)] rounded-md border border-kite-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface rounded-t-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView("profile")} className="p-1 text-kite-text hover:bg-gray-100 dark:hover:bg-[#131415] rounded-full transition-colors flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text whitespace-nowrap">Funds</h1>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 border-b border-kite-border-soft pb-8">
          {/* Left: Balances */}
          <div className="flex-1 max-w-lg">
            <h2 className="text-[20px] md:text-[24px] font-medium text-kite-text mb-6">Bank balance</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-kite-border-soft pb-2">
                <span className="text-[14px] text-kite-text-light">Available margin</span>
                <span className="text-[24px] font-medium text-kite-blue">
                  ₹{formatINR(unifiedBalance).replace("₹", "")}
                </span>
              </div>
              
              <div className="flex justify-between items-end border-b border-kite-border-soft pb-2">
                <span className="text-[14px] text-kite-text-light">Used margin</span>
                <span className="text-[14px] font-medium text-kite-text">
                  ₹{formatINR(totalAmountInvested).replace("₹", "")}
                </span>
              </div>
              
              <div className="flex justify-between items-end pb-2">
                <span className="text-[14px] text-kite-text-light">Available cash</span>
                <span className="text-[14px] font-medium text-kite-text">
                  ₹{formatINR(unifiedBalance + totalAmountInvested).replace("₹", "")}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setFundAction("add")}
                className="flex-1 bg-kite-blue hover:bg-opacity-90 active:scale-[0.98] text-white font-medium py-2.5 rounded text-[14px] transition-all"
              >
                Add funds
              </button>
              <button 
                onClick={() => setFundAction("withdraw")}
                className="flex-1 bg-white dark:bg-kite-bg hover:bg-gray-50 dark:hover:bg-[#131415] active:scale-[0.98] text-kite-text border border-kite-border-soft font-medium py-2.5 rounded text-[14px] transition-all"
              >
                Withdraw
              </button>
            </div>
          </div>
          
          {/* Right: Bank Statement Link / Summary */}
          <div className="flex-1 md:border-l md:border-kite-border-soft md:pl-10 flex flex-col justify-center">
            <h3 className="text-[14px] text-kite-text-light mb-4 uppercase tracking-wider">Bank Details</h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light">Bank Name</span>
                <span className="text-[14px] text-kite-text font-medium">{investor.bankDetails?.bankName || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-kite-text-light">Account Number</span>
                <span className="text-[14px] text-kite-text font-mono font-medium">{investor.bankDetails?.accountNumber || "-"}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setCurrentView("statement")}
              className="mt-6 flex items-center justify-between w-full p-4 border border-kite-border-soft rounded hover:bg-gray-50 dark:hover:bg-kite-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-kite-blue" />
                <span className="text-[14px] font-medium text-kite-text">View statement</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-kite-text-light rotate-180" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Fund Modals */}
      {fundAction && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-fade-in investors-portal">
          <div className="bg-white dark:bg-kite-surface w-full max-w-sm rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-kite-border-soft flex items-center justify-between bg-gray-50 dark:bg-kite-bg/50">
              <h3 className="text-[16px] font-medium text-kite-text">
                {fundAction === "add" ? "Add Funds" : "Withdraw Funds"}
              </h3>
              <button 
                onClick={() => { setFundAction(null); setFundAmount(""); }} 
                className="text-kite-text-light hover:text-kite-text transition-colors text-[24px] leading-none"
              >&times;</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kite-text-light font-mono text-[16px]">₹</span>
                  <input
                    type="text"
                    value={fundAmount ? Number(fundAmount.replace(/,/g, '')).toLocaleString('en-IN') : ''}
                    onChange={(e) => {
                       const val = e.target.value.replace(/,/g, '');
                       if (!isNaN(Number(val)) && val.trim() !== '') {
                         setFundAmount(val);
                       } else if (val === '') {
                         setFundAmount('');
                       }
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-kite-surface border border-kite-border-soft rounded font-mono text-[18px] text-kite-text focus:outline-none focus:border-kite-blue transition-colors"
                    autoFocus
                  />
                </div>
                {fundAction === "withdraw" && (
                  <p className="mt-2 text-[12px] text-kite-text-light">
                    Available to withdraw: ₹{formatINR(Math.max(0, unifiedBalance)).replace("₹", "")}
                  </p>
                )}
              </div>
              
              <button
                disabled={!fundAmount || parseFloat(fundAmount) <= 0 || (fundAction === 'withdraw' && parseFloat(fundAmount) > unifiedBalance)}
                onClick={() => {
                  const amt = parseFloat(fundAmount);
                  if (amt > 0) {
                    const newFundHistory = investor.fundHistory || [];
                    newFundHistory.push({
                      id: Math.random().toString(36).substring(7),
                      amount: amt,
                      type: fundAction === "add" ? "ADD" : "WITHDRAW",
                      date: new Date().toISOString()
                    });
                    
                    const updatedInvestor = {
                      ...investor,
                      fundHistory: newFundHistory
                    };
                    
                    dispatch({ type: "UPDATE_INVESTOR", payload: updatedInvestor });
                    setFundAction(null);
                    setFundAmount("");
                  }
                }}
                className="w-full bg-kite-blue disabled:bg-opacity-50 hover:bg-opacity-90 active:scale-[0.98] text-white font-medium py-3 rounded text-[14px] transition-all"
              >
                {fundAction === "add" ? "Add Funds" : "Withdraw"}
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  )}
    {currentView === "statement" && (
      <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 pt-16 md:pt-4 px-3 md:px-0 w-full bg-white dark:bg-kite-surface min-h-[calc(100vh-64px)] rounded-md border border-kite-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface rounded-t-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView("profile")} className="p-1 text-kite-text hover:bg-gray-100 dark:hover:bg-[#131415] rounded-full transition-colors flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text whitespace-nowrap">Bank Statement</h1>
          </div>
          <div className="relative w-full max-w-[200px] md:max-w-xs ml-4">
            <Search className="w-4 h-4 text-kite-text-light absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={statementSearch}
              onChange={(e) => setStatementSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 md:py-2 bg-gray-50 dark:bg-kite-bg border border-kite-border-soft rounded text-[13px] md:text-[14px] text-kite-text focus:outline-none focus:border-kite-blue w-full transition-colors"
            />
          </div>
        </div>

        {/* Bank Details Banner */}
        <div className="px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-kite-bg/50 p-4 md:p-5 rounded-md border border-kite-border-soft">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] text-kite-text-light font-medium tracking-wider uppercase">Investor Name</span>
              <span className="text-[13px] md:text-[14px] text-kite-text font-medium">{investor.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] text-kite-text-light font-medium tracking-wider uppercase">Bank Name</span>
              <span className="text-[13px] md:text-[14px] text-kite-text font-medium">{investor.bankDetails?.bankName || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] text-kite-text-light font-medium tracking-wider uppercase">Account Number</span>
              <span className="text-[13px] md:text-[14px] text-kite-text font-mono font-medium">{investor.bankDetails?.accountNumber || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] text-kite-text-light font-medium tracking-wider uppercase">Holder Name</span>
              <span className="text-[13px] md:text-[14px] text-kite-text font-medium">{investor.bankDetails?.accountHolderName || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-[11px] text-kite-text-light font-medium tracking-wider uppercase">IFSC Code</span>
              <span className="text-[13px] md:text-[14px] text-kite-text font-mono font-medium">{investor.bankDetails?.ifscCode || "-"}</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="px-4 md:px-6 pb-6 overflow-x-auto">
          <div className="border border-kite-border rounded-md overflow-hidden min-w-[600px]">
            <table className="w-full text-left text-[13px] md:text-[14px] text-kite-text">
              <thead className="bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] border-b border-kite-border">
                <tr>
                  <th className="py-3 px-4 font-normal text-kite-text-light text-[11px] md:text-[12px] uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 font-normal text-kite-text-light text-[11px] md:text-[12px] uppercase tracking-wider">Transaction Details</th>
                  <th className="py-3 px-4 text-right font-normal text-kite-text-light text-[11px] md:text-[12px] uppercase tracking-wider">Debit (-₹)</th>
                  <th className="py-3 px-4 text-right font-normal text-kite-text-light text-[11px] md:text-[12px] uppercase tracking-wider">Credit (+₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kite-border-soft">
                {filteredBankTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors">
                    <td className="py-3.5 px-4 text-[12px] md:text-[13px] text-kite-text-light whitespace-nowrap align-middle">
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                       <div className="flex items-center gap-2">
                         <span className="text-[13px] md:text-[14px] font-medium text-kite-text whitespace-nowrap">{tx.title}</span>
                         <span className="text-[12px] md:text-[13px] text-kite-text-light truncate hidden sm:inline-block max-w-sm md:max-w-md">- {tx.description}</span>
                       </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[13px] md:text-[14px] align-middle whitespace-nowrap text-[#DF514C] dark:text-[#E25F5B]">
                      {tx.type === "DEBIT" ? `₹${formatINR(tx.amount).replace("₹", "")}` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[13px] md:text-[14px] align-middle whitespace-nowrap text-[#4CAF50] dark:text-[#5B9A5D]">
                      {tx.type === "CREDIT" ? `₹${formatINR(tx.amount).replace("₹", "")}` : "-"}
                    </td>
                  </tr>
                ))}
                {filteredBankTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-kite-text-light text-[13px] md:text-[14px] bg-[#F8F9FA] dark:bg-kite-bg/30">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
