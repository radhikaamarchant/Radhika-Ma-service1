import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  BadgeCheck,
  X,
  Building2,
  Bell,
  User,
  Info,
  Users,
  Clock,
  Search,
  Lock,
  Settings
} from "lucide-react";
import { useTheme } from "../utils/ThemeContext";
import { generateAppCode, getAppCodeRemainingSeconds } from "../utils/totp";
import Cropper from "react-easy-crop";
import { useAppContext } from "../utils/AppContext";
import {
  getUnifiedBankBalance,
  getUnifiedTransactions,
} from "../utils/bankBalance";
import { formatINR } from "../utils/mockData";
import { googleSignIn, auth } from "../utils/firebase";

interface AdminProfile {
  name: string;
  address: string;
  photoUrl: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
}

type AdminView = "menu" | "funds" | "profile" | "bank" | "statement" | "market" | "users" | "show_users" | "settings";

export default function AdminPage() {
  const { state, dispatch } = useAppContext();
  const [showAppCode, setShowAppCode] = useState(false);
  const [appCode, setAppCode] = useState("");
  const [appCodeSeconds, setAppCodeSeconds] = useState(0);

  useEffect(() => {
    if (showAppCode) {
      const updateCode = () => {
        setAppCode(generateAppCode(state.currentUser?.userId || ""));
        setAppCodeSeconds(getAppCodeRemainingSeconds());
      };
      updateCode();
      const interval = setInterval(updateCode, 1000);
      return () => clearInterval(interval);
    }
  }, [showAppCode, state.currentUser]);

  const [profile, setProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem("adminProfile");




    return saved
      ? JSON.parse(saved)
      : { name: "Radhika Marchant", address: "", photoUrl: "" };
  });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "INVESTOR" });
  const [currentView, setCurrentView] = useState<AdminView>("menu");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [googleUser, setGoogleUser] = useState(auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser : null);
  const { theme, setTheme } = useTheme();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -50;
    
    if (isRightSwipe && currentView === "settings") {
      setCurrentView("menu");
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setGoogleUser(user && !user.isAnonymous ? user : null);
    });
    return unsub;
  }, []);

  const [formData, setFormData] = useState(profile);
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const defaultDay = { isOpen: true, openTime: "09:15", closeTime: "15:30" };
  const initialDays = daysOfWeek.reduce((acc: any, day: string) => {
      acc[day] = state.settings?.marketTiming?.days?.[day] || { ...defaultDay };
      return acc;
  }, {});

  const [marketTiming, setMarketTiming] = useState<any>({
    openTime: state.settings?.marketTiming?.openTime || "09:15",
    closeTime: state.settings?.marketTiming?.closeTime || "15:30",
    days: initialDays
  });

  useEffect(() => {
    if (state.settings?.marketTiming) {
      const updatedDays = daysOfWeek.reduce((acc: any, day: string) => {
          acc[day] = state.settings?.marketTiming?.days?.[day] || { ...defaultDay };
          return acc;
      }, {});
      setMarketTiming({
         openTime: state.settings.marketTiming.openTime || "09:15",
         closeTime: state.settings.marketTiming.closeTime || "15:30",
         days: updatedDays
      });
    }
  }, [state.settings?.marketTiming]);

  const handleSaveMarketTiming = () => {
    if (state.settings) {
      const updatedSettings = {
        ...state.settings,
        marketTiming,
      };
      dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });
      setCurrentView("menu");
    }
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    localStorage.setItem("adminProfile", JSON.stringify(formData));
    setProfile(formData);
    setCurrentView("menu");
    window.dispatchEvent(new Event("adminProfileUpdated"));
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSrc(reader.result?.toString() || null),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  const generateUserId = () => {
    let maxId = 108; // start from RMAS109
    state.users.forEach(u => {
      if (u.userId && u.userId.startsWith("RMAS")) {
        const num = parseInt(u.userId.replace("RMAS", ""), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    return "RMAS" + (maxId + 1);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = generateUserId();
    try {
      await dispatch({
        type: "ADD_USER",
        payload: {
          id: generatedId,
          userId: generatedId,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role as any,
        }
      });
      setShowAddUser(false);
      setNewUser({ name: "", email: "", password: "", role: "INVESTOR" });
    } catch (err) {
      console.error(err);
      alert("Error adding user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Delete this user?")) {
      await dispatch({ type: "DELETE_USER", payload: id });
    }
  };


  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Scale down if too large
    // @ts-ignore
    const maxSize = 400;
    // @ts-ignore
    let targetWidth = croppedAreaPixels.width;
    // @ts-ignore
    let targetHeight = croppedAreaPixels.height;
    if (targetWidth > maxSize || targetHeight > maxSize) {
      const ratio = Math.min(maxSize / targetWidth, maxSize / targetHeight);
      targetWidth *= ratio;
      targetHeight *= ratio;
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(
      image,
      // @ts-ignore
      croppedAreaPixels.x,
      // @ts-ignore
      croppedAreaPixels.y,
      // @ts-ignore
      croppedAreaPixels.width,
      // @ts-ignore
      croppedAreaPixels.height,
      0,
      0,
      targetWidth,
      targetHeight,
    );
    const base64Image = canvas.toDataURL("image/jpeg", 0.7);
    
    // Save photo immediately
    const updatedProfile = { ...formData, photoUrl: base64Image };
    setFormData(updatedProfile);
    localStorage.setItem("adminProfile", JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    window.dispatchEvent(new Event("adminProfileUpdated"));
    
    setImageSrc(null);
  };

  const unifiedBalance = getUnifiedBankBalance(
    profile.name,
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );

  const bankTransactions = getUnifiedTransactions(
    profile.name,
    state.businesses,
    state.investors,
    state.investments,
    state.settings,
  );

  const calculateFees = () => {
    let regOwnerFees = 0;
    state.businesses.forEach(b => {
      if (b.id !== "admin_business") {
        regOwnerFees += (b.registrationCommissionPaid || 0) + (b.taxPaid || 0);
      }
    });

    let investorFees = 0;
    state.investors.forEach(i => {
      if (i.id !== "admin_investor") {
        investorFees += (i.rmasServiceCharge || 0);
      }
    });

    let authorities = 0;
    let investmentsCommission = 0;
        let brokerage = 0;
    let hpgTax = 0;
    
    state.investments.forEach(inv => {
      investmentsCommission += (inv.adminCommissionBusiness || 0) + (inv.adminCommissionInvestor || 0);
      
      if (inv.status === "completed" && inv.payoutDetails) {
        authorities += (inv.payoutDetails.rmasSubsidyPays || 0);
        brokerage += (inv.payoutDetails.rmasCommission || 0);
        hpgTax += (inv.payoutDetails.happyIncomeTax || 0);
      }
    });
    
    try {
      const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
      bidsComms.forEach((c: any) => {
         brokerage += (c.amount || 0);
      });
    } catch(e) {}

    return {
      regOwnerFees,
      investorFees,
      authorities,
      investmentsCommission,
      brokerage,
      hpgTax
    };
  };

  const fees = calculateFees();

  return (
    <div className="bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] min-h-full flex flex-col font-sans w-full">
      <div className="w-full flex-1 bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] pb-0 md:pb-0">
        
        {currentView === "menu" && (
          <div className="animate-fade-in">
            <div className="px-5 pt-6 pb-2">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-[26px] md:text-[28px] font-bold text-kite-text">
                  Account
                </h1>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 rounded-full hover:bg-gray-200 dark:md:hover:bg-[#131415] transition-colors focus:outline-none"
                  >
                    <Bell className="w-5 h-5 text-kite-text-light" />
                    {state.error && localStorage.getItem("hideErrorBanner") !== "true" && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-kite-bg"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-kite-surface rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-kite-border z-[100] p-4 text-left">
                      {state.error && localStorage.getItem("hideErrorBanner") !== "true" ? (
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between items-start gap-2">
                             <span className="text-[#DF514C] dark:text-[#E25F5B] text-[13px] font-medium leading-snug">{state.error}</span>
                             <button 
                               onClick={() => {
                                 localStorage.setItem("hideErrorBanner", "true");
                                 dispatch({ type: "CLEAR_ERROR" } as any);
                                 setShowNotifications(false);
                               }} 
                               className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                      ) : (
                        <p className="text-[13px] text-kite-text-light text-center py-4">No new notifications</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[15px] md:text-[16px] text-kite-text mb-2 tracking-wide flex items-center gap-1.5">
                {state.currentUser?.name || profile.name} <BadgeCheck className="w-[18px] h-[18px] text-kite-blue " />
              </p>
            </div>
            
            <div className="px-5 pb-6">
               <div className="bg-white dark:bg-kite-surface rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none p-5 relative">
                  <div className="flex justify-between items-center">
                     <div>
                       <h2 className="text-[16px] md:text-[18px] font-bold text-kite-text uppercase tracking-wide">
    {state.currentUser && state.currentUser.userId ? state.currentUser.userId : "RMAS OFFICIAL"}
  </h2>
                       <p className="text-[13px] md:text-[14px] text-kite-text-light mt-0.5 tracking-wide">{state.currentUser?.email || "radhikaamarchant@gmail.com"}</p>
                     </div>
                     <div className="relative cursor-pointer shrink-0 ml-4" onClick={() => fileInputRef.current?.click()}>
                       <div className="w-[72px] h-[72px] md:w-[76px] md:h-[76px] rounded-full bg-[#E8F0FE] dark:bg-kite-blue/20 text-kite-blue  flex items-center justify-center overflow-hidden relative">
                         {profile.photoUrl ? (
                           <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-[26px] font-normal">{(state.currentUser?.name || profile.name).substring(0, 2).toUpperCase()}</span>
                         )}
                         <div className="absolute bottom-0 w-full h-1/3 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                           <Upload className="w-3 h-3 text-white" />
                         </div>
                       </div>
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
               </div>
            </div>
            
            <div className="bg-white dark:bg-kite-surface pt-4 pb-8 min-h-[50vh]">
               <div className="px-5 py-4 border-b border-kite-border-soft">
                 <h3 className="text-[14px] md:text-[15px] font-medium text-kite-text">Account</h3>
               </div>
               <div className="flex flex-col">
                 <button onClick={() => setCurrentView("funds")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Funds</span>
                    <span className="text-[18px] text-kite-text-light font-serif mr-1">₹</span>
                 </button>
                 
                 <button onClick={() => setShowAppCode(true)} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">App Code</span>
                    <Lock className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 <button onClick={() => setCurrentView("profile")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Profile</span>
                    <User className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 <button onClick={() => setCurrentView("settings")} className="md:hidden flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] font-normal text-kite-text">Setting</span>
                    <Settings className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 <button onClick={() => setCurrentView("show_users")} className="hidden md:flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Show User Details</span>
                    <Users className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 {state.currentUser?.role === "CEO" && (
                 <button onClick={() => setCurrentView("users")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Users</span>
                    <Users className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 )}
                 <button onClick={() => setCurrentView("bank")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Bank details</span>
                    <Building2 className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>
                 <button onClick={() => setCurrentView("market")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-kite-text">Market Time</span>
                    <Clock className="w-4 h-4 text-kite-text-light mr-1" />
                 </button>

                 <button onClick={() => { localStorage.removeItem("loggedInUserId"); dispatch({ type: "SET_CURRENT_USER", payload: null }); }} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group w-full text-left">
                    <span className="text-[15px] md:text-[16px] font-normal text-[#DF514C] dark:text-[#E25F5B]">Log out</span>
                 </button>

               </div>
            </div>
          </div>
        )}

        {currentView === "funds" && (
          <div className="bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] min-h-full flex flex-col animate-fade-in relative -mx-0">
            <div className="bg-white dark:bg-kite-surface flex items-center px-4 py-4 md:py-5 border-b border-kite-border-soft sticky top-0 z-10">
              <button onClick={() => setCurrentView("menu")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Funds</h1>
            </div>

            <div className="p-4 md:p-5 flex-1">
              <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-5 mb-6 text-center">
                <p className="text-[12px] md:text-[13px] text-kite-text-light font-normal mb-2 flex items-center justify-center gap-1.5">
                  Available margin (Cash + Collateral) <Info className="w-3.5 h-3.5 text-kite-blue " />
                </p>
                <p className="text-[28px] md:text-[32px] font-medium text-kite-blue  tracking-wide mb-4">
                  {unifiedBalance >= 0 ? "" : "-"}₹{formatINR(Math.abs(unifiedBalance)).replace("₹", "")}
                </p>
                <button 
                  onClick={() => setCurrentView("statement")}
                  className="flex items-center justify-center gap-1.5 text-[13px] md:text-[14px] text-kite-blue  font-normal mx-auto"
                >
                  <span className="w-2.5 h-2.5 border-2 border-kite-blue rounded-full inline-block"></span>
                  View statement
                </button>
              </div>

              <div className="bg-white dark:bg-kite-surface border-t border-kite-border-soft mt-2 pb-0">
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Opening balance</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">30,00,00,000.00</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Reg owner fees</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.regOwnerFees).replace("₹", "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Investor fees</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.investorFees).replace("₹", "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Authorities</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.authorities).replace("₹", "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Investments</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.investmentsCommission).replace("₹", "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">Brokerage</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.brokerage).replace("₹", "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 md:py-4 px-4 border-b border-kite-border-soft">
                  <span className="text-[13px] md:text-[14px] text-kite-text font-normal">HPG Tax</span>
                  <span className="text-[13px] md:text-[14px] text-kite-text font-mono">{formatINR(fees.hpgTax).replace("₹", "")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "profile" && (
          <div className="bg-white dark:bg-kite-surface flex-1 min-h-full animate-fade-in relative pb-0">
            <div className="px-4 py-4 flex items-center border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <button onClick={() => { setCurrentView("menu"); setFormData(profile); }} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Profile Details</h1>
            </div>
            
            <div className="p-5 md:p-6 space-y-6">
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  Office / Home Address
                </label>
                <textarea
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors resize-none h-20"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="pt-4">
                <button onClick={handleSave} className="w-full bg-kite-blue text-white py-3 rounded font-normal text-[14px] md:text-[15px] hover:opacity-90 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        
        {currentView === "users" && (
          <div className="bg-white dark:bg-kite-surface flex-1 min-h-full animate-fade-in relative pb-0">
            <div className="px-4 py-4 flex items-center justify-between border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <div className="flex items-center">
                <button onClick={() => setCurrentView("menu")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Manage Users</h1>
              </div>
              <button onClick={() => setShowAddUser(true)} className="bg-kite-blue text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium">
                Add User
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-x-auto">
              {state.users.length === 0 ? (
                <div className="text-center py-10 text-kite-text-light text-[14px]">No users added yet.</div>
              ) : (
                <table className="w-full min-w-[600px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-kite-border-soft text-[11px] uppercase text-kite-text-light tracking-wider">
                      <th className="pb-2 font-normal">User ID</th>
                      <th className="pb-2 font-normal">Name</th>
                      <th className="pb-2 font-normal">Email</th>
                      <th className="pb-2 font-normal">Password</th>
                      <th className="pb-2 font-normal">Role</th>
                      <th className="pb-2 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.slice().sort((a,b) => {
                       const anum = parseInt((a.userId||"").replace("RMAS",""))||0;
                       const bnum = parseInt((b.userId||"").replace("RMAS",""))||0;
                       return bnum - anum;
                    }).map((user) => (
                      <tr key={user.id} className="border-b border-kite-border-soft hover:bg-gray-50 dark:md:hover:bg-[#131415]">
                        <td className="py-3 text-[13px] text-kite-text">{user.userId || user.id}</td>
                        <td className="py-3 text-[13px] text-kite-text">{user.name}</td>
                        <td className="py-3 text-[13px] text-kite-text">{user.email}</td>
                        <td className="py-3 text-[13px] text-kite-text font-mono">{user.password || 'N/A'}</td>
                        <td className="py-3 text-[13px] text-kite-text">{user.role}</td>
                        <td className="py-3 text-right">
                           <button onClick={() => handleDeleteUser(user.id)} className="text-[#DF514C] dark:text-[#E25F5B] hover:text-[#DF514C] dark:text-[#E25F5B] text-[13px]">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-kite-surface w-full max-w-md rounded-md shadow-lg overflow-hidden animate-fade-in">
                  <div className="px-5 py-4 border-b border-kite-border-soft flex justify-between items-center">
                    <h2 className="text-[16px] font-medium text-kite-text">Add New User</h2>
                    <button onClick={() => setShowAddUser(false)} className="text-kite-text-light hover:text-kite-text">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddUser} className="p-5 space-y-4">
                    <div>
                      <label className="block text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Name</label>
                      <input type="text" required className="w-full border border-kite-border-soft rounded px-3 py-2 text-[14px] bg-transparent text-kite-text focus:border-kite-blue outline-none" 
                        value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Email (Optional)</label>
                      <input type="email" className="w-full border border-kite-border-soft rounded px-3 py-2 text-[14px] bg-transparent text-kite-text focus:border-kite-blue outline-none" 
                        value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Password</label>
                      <input type="text" required className="w-full border border-kite-border-soft rounded px-3 py-2 text-[14px] bg-transparent text-kite-text focus:border-kite-blue outline-none" 
                        value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[12px] text-kite-text-light mb-1 uppercase tracking-wider">Role</label>
                      <select className="w-full border border-kite-border-soft rounded px-3 py-2 text-[14px] bg-transparent text-kite-text focus:border-kite-blue outline-none"
                        value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                        <option value="INVESTOR">Investor</option>
                        <option value="BUSINESS_OWNER">Business Owner</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="CEO">Admin (CEO)</option>
                      </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 text-[14px] text-kite-text border border-kite-border-soft rounded">Cancel</button>
                      <button type="submit" className="px-4 py-2 text-[14px] bg-kite-blue text-white rounded hover:bg-opacity-90">Add User</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}


        {currentView === "bank" && (
          <div className="bg-white dark:bg-kite-surface flex-1 min-h-full animate-fade-in relative pb-0">
            <div className="px-4 py-4 flex items-center border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <button onClick={() => { setCurrentView("menu"); setFormData(profile); }} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Bank details</h1>
            </div>
            
            <div className="p-5 md:p-6 space-y-6">
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors"
                  value={formData.bankName || ""}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-mono text-kite-text focus:border-kite-blue outline-none transition-colors"
                  value={formData.accountNumber || ""}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-mono uppercase text-kite-text focus:border-kite-blue outline-none transition-colors"
                  value={formData.ifscCode || ""}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-[12px] md:text-[13px] font-medium uppercase tracking-wider text-kite-text-light mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  className="w-full border-b border-kite-border py-2 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors"
                  value={formData.branch || ""}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
              
              <div className="pt-4">
                <button onClick={handleSave} className="w-full bg-kite-blue text-white py-3 rounded font-normal text-[14px] md:text-[15px] hover:opacity-90 transition-colors">
                  Save Bank Details
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === "show_users" && (
          <div className="bg-white dark:bg-kite-surface flex-1 min-h-full animate-fade-in relative pb-0 hidden md:block">
            <div className="px-4 py-4 flex flex-col gap-4 border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <div className="flex items-center">
                <button onClick={() => setCurrentView("menu")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">User Details</h1>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-kite-text-light" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] border border-kite-border rounded text-[14px] text-kite-text focus:outline-none focus:border-kite-blue transition-colors"
                />
              </div>
            </div>
            
            <div className="p-4 md:p-6 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-kite-border-soft text-[11px] uppercase text-kite-text-light tracking-wider">
                    <th className="pb-3 px-4 font-normal">ID</th>
                    <th className="pb-3 px-4 font-normal">Name</th>
                    <th className="pb-3 px-4 font-normal">Email ID</th>
                    <th className="pb-3 px-4 font-normal">Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kite-border-soft">
                  {state.users
                    .filter(u => u.role === "INVESTOR" && (
                      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.userId.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      (u.email || "").toLowerCase().includes(userSearchTerm.toLowerCase())
                    ))
                    .map((u, i) => (
                      <tr key={u.id || i} className="hover:bg-gray-50 dark:md:hover:bg-[#131415] transition-colors">
                        <td className="py-3 px-4 text-[14px] font-medium text-kite-text">{u.userId}</td>
                        <td className="py-3 px-4 text-[14px] text-kite-text">{u.name}</td>
                        <td className="py-3 px-4 text-[14px] text-kite-text">{u.email || '-'}</td>
                        <td className="py-3 px-4 text-[14px] font-mono text-kite-text-light">{u.password}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {state.users.filter(u => u.role === "INVESTOR").length === 0 && (
                <div className="text-center py-10 text-kite-text-light text-[14px]">No users signed up yet.</div>
              )}
            </div>
          </div>
        )}

        {currentView === "market" && (
          <div className="bg-white dark:bg-kite-surface flex-1 min-h-full animate-fade-in relative pb-0">
            <div className="px-4 py-4 flex items-center border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <button onClick={() => setCurrentView("menu")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Market Timing</h1>
            </div>
            
            <div className="p-5 md:p-6 space-y-6">
              <div className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                   <div key={day} className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-kite-border py-3 gap-2">
                      <div className="flex items-center space-x-3 w-32">
                         <input type="checkbox" checked={marketTiming.days[day].isOpen} onChange={(e) => {
                             setMarketTiming((prev: any) => ({
                               ...prev,
                               days: { ...prev.days, [day]: { ...prev.days[day], isOpen: e.target.checked } }
                             }));
                         }} className="w-4 h-4 text-kite-blue border-kite-border rounded focus:ring-kite-blue focus:ring-1" />
                         <span className="text-[14px] text-kite-text font-medium capitalize">{day}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-1 w-full md:w-auto">
                         <div className="flex-1">
                             <input type="time" disabled={!marketTiming.days[day].isOpen}
                                value={marketTiming.days[day].openTime} 
                                onChange={(e) => setMarketTiming((prev: any) => ({
                                   ...prev,
                                   days: { ...prev.days, [day]: { ...prev.days[day], openTime: e.target.value } }
                                }))}
                                className="w-full border-b border-kite-border py-1 bg-transparent text-[14px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors disabled:opacity-50" />
                         </div>
                         <span className="text-kite-text-light text-[12px]">to</span>
                         <div className="flex-1">
                             <input type="time" disabled={!marketTiming.days[day].isOpen}
                                value={marketTiming.days[day].closeTime} 
                                onChange={(e) => setMarketTiming((prev: any) => ({
                                   ...prev,
                                   days: { ...prev.days, [day]: { ...prev.days[day], closeTime: e.target.value } }
                                }))}
                                className="w-full border-b border-kite-border py-1 bg-transparent text-[14px] font-normal text-kite-text focus:border-kite-blue outline-none transition-colors disabled:opacity-50" />
                         </div>
                      </div>
                   </div>
                ))}
              </div>
              
              <div className="pt-4">
                <button onClick={handleSaveMarketTiming} className="w-full bg-kite-blue text-white py-3 rounded font-normal text-[14px] md:text-[15px] hover:opacity-90 transition-colors">
                  Save Market Time
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === "statement" && (
          <div className="bg-white dark:bg-kite-surface flex-1 animate-fade-in relative pb-0 min-h-full">
            <div className="px-4 py-4 flex items-center border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <button onClick={() => setCurrentView("funds")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] md:text-[20px] font-medium text-kite-text">Financial Statement</h1>
            </div>

            <div className="p-4 md:p-6">
              {bankTransactions.length > 0 ? (
                <div className="border border-kite-border rounded overflow-hidden">
                  <table className="w-full text-left text-[13px] md:text-[14px] text-kite-text">
                    <thead className="bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] border-b border-kite-border">
                      <tr>
                        <th className="py-3 px-4 font-normal text-kite-text-light text-[12px] uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 font-normal text-kite-text-light text-[12px] uppercase tracking-wider">Particulars</th>
                        <th className="py-3 px-4 text-right font-normal text-kite-text-light text-[12px] uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-kite-border-soft">
                      {bankTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:md:hover:bg-[#131415]">
                          <td className="py-3 px-4 text-[12px] text-kite-text-light whitespace-nowrap align-top">
                            {new Date(tx.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 align-top">
                            <p className="text-[13px] md:text-[14px] font-medium text-kite-text">{tx.title}</p>
                            <p className="text-[12px] text-kite-text-light mt-0.5">{tx.description}</p>
                          </td>
                          <td className={`py-3 px-4 text-right font-mono text-[13px] md:text-[14px] align-top ${tx.type === "CREDIT" ? "text-[#4CAF50] dark:text-[#5B9A5D]" : "text-kite-text"}`}>
                            {tx.type === "CREDIT" ? "+" : "-"}
                            {formatINR(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-kite-text-light text-[13px] md:text-[14px] border border-kite-border-soft rounded bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818]">
                  No transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "settings" && (
          <div 
            className="bg-[#F8F9FA] dark:bg-kite-bg flex-1 animate-fade-in relative pb-0 min-h-full md:hidden block"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndEvent}
          >
            <div className="px-4 py-4 flex items-center border-b border-kite-border-soft sticky top-0 z-10 bg-white dark:bg-kite-surface">
              <button onClick={() => setCurrentView("menu")} className="mr-4 text-kite-text p-1 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-[18px] font-medium text-kite-text">Settings</h1>
            </div>

            <div className="pt-2">
               <div className="px-5 py-3 border-b border-kite-border-soft bg-white dark:bg-kite-surface">
                 <span className="text-[13px] text-kite-blue font-medium uppercase tracking-wider">Theme</span>
               </div>
               <div className="bg-white dark:bg-kite-surface">
                 <button onClick={() => setTheme("light")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft active:bg-gray-50 dark:active:bg-[#131415] w-full text-left">
                    <span className="text-[15px] font-normal text-kite-text">Default</span>
                    {theme === "light" && <BadgeCheck className="w-4 h-4 text-kite-blue" />}
                 </button>
                 <button onClick={() => setTheme("dark")} className="flex items-center justify-between px-5 py-4 border-b border-kite-border-soft active:bg-gray-50 dark:active:bg-[#131415] w-full text-left">
                    <span className="text-[15px] font-normal text-kite-text">Dark</span>
                    {theme === "dark" && <BadgeCheck className="w-4 h-4 text-kite-blue" />}
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Image Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-kite-surface rounded w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-kite-border-soft flex justify-between items-center">
              <h3 className="font-medium text-[15px] md:text-[16px] text-kite-text">
                Crop Photo
              </h3>
              <button
                onClick={() => setImageSrc(null)}
                className="p-1 hover:bg-gray-100 dark:md:hover:bg-[#131415] rounded-full text-kite-text-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-5 md:p-6 bg-white dark:bg-kite-surface border-t border-kite-border-soft">
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-[13px] md:text-[14px] font-medium text-kite-text-light">
                  Zoom
                </span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setImageSrc(null)}
                  className="px-5 py-2 text-[13px] md:text-[14px] font-normal text-kite-text hover:bg-gray-50 dark:md:hover:bg-[#131415] border border-kite-border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={createCroppedImage}
                  className="px-5 py-2 text-[13px] md:text-[14px] font-normal text-white bg-kite-blue hover:opacity-90 rounded shadow-sm"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAppCode && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 animate-fade-in" onClick={() => setShowAppCode(false)}>
          <div className="bg-white dark:bg-kite-surface w-full max-w-md rounded-t-2xl p-6 pb-12 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-[20px] font-semibold text-kite-text mb-2">App Code</h2>
            <p className="text-[14px] text-kite-text-light mb-8">Enter this code to login to Kite web</p>
            <div className="text-[32px] font-medium tracking-[0.5em] text-kite-text mb-6">
              {appCode}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-0.5 mb-4 relative">
              <div 
                className="absolute top-0 left-0 h-full bg-kite-blue transition-all duration-1000 ease-linear" 
                style={{ width: `${(appCodeSeconds / 30) * 100}%` }}
              ></div>
            </div>
            <p className="text-[13px] text-kite-text-light">
              Changes in <span className="text-kite-blue">{appCodeSeconds}s</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
