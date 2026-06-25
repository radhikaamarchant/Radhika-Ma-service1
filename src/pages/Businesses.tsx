import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, Search, Building2, Banknote, Building, X, BadgeCheck, ChevronDown, Clock, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { Business } from '../types';
import BusinessDetail from '../components/BusinessDetail';
import { INDIAN_BANKS } from '../utils/indianBanks';

import { getVerificationStats } from '../utils/blueTick';
// Removed local MarketTrendCell
import { MarketTrendCell } from '../components/MarketTrendCell';

export default function Businesses() {
 const { state, dispatch } = useAppContext();
 const [viewMode, setViewMode] = useState<'list' | 'add-step-1' | 'add-step-2'>('list');
 const [ownerMode, setOwnerMode] = useState<'new' | 'existing'>('new');
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
 const [showInterestCalculation, setShowInterestCalculation] = useState(false);
 const [showOwnerSelect, setShowOwnerSelect] = useState(false);
 const [ownerSearch, setOwnerSearch] = useState('');

 // Scroll preservation
 const scrollPosRef = useRef<number>(0);
 const mainRef = useRef<HTMLElement | null>(null);

 useEffect(() => {
   mainRef.current = document.querySelector('main');
 }, []);

 useEffect(() => {
   // Use selectedBusinessId to check if detail view is active
   const isList = viewMode === 'list' && !selectedBusinessId;
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
 businessId: '',
 name: '',
 ownerName: '',
 authorityType: 'Business Authorities' as any,
 rmasSubsidy: '4',
 fundingRequired: '',
 interestRate: '',
 bankName: INDIAN_BANKS[0],
 accountNumber: '',
 ifscCode: '',
 accountHolderName: '',
 registrationFee: '',
 commissionPercentage: '1',
 taxPercentage: '18',
 });

 const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;

 const uniqueBusinesses = Array.from(new Map<string, Business>(state.businesses.map(b => [b.id, b])).values());
 const filteredBusinesses = uniqueBusinesses.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 b.businessId?.includes(searchTerm)
 ).sort((a, b) => getTime(b.id) - getTime(a.id));

 const statsMap = getVerificationStats(state.businesses, state.investments);
 const isBlueTick = (bizId: string) => statsMap.get(bizId)?.isBlueTick ?? false;
 const isPreVerified = (bizId: string) => statsMap.get(bizId)?.isPreVerified ?? false;

 const uniqueOwners = Array.from(new Set(state.businesses.map(b => b.businessId))).map(id => state.businesses.find(b => b.businessId === id)!);

 const handleExistingOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
 const selectedOwnerId = e.target.value;
 const ownerRecord = state.businesses.find(b => b.businessId === selectedOwnerId);
 if (ownerRecord) {
 setFormData({
 ...formData,
 businessId: ownerRecord.businessId,
 ownerName: ownerRecord.ownerName,
 authorityType: ownerRecord.authorityType || ('Business Authorities' as any),
 rmasSubsidy: ownerRecord.rmasSubsidy?.toString() || '4',
 bankName: ownerRecord.bankDetails?.bankName || INDIAN_BANKS[0],
 accountNumber: ownerRecord.bankDetails?.accountNumber || '',
 ifscCode: ownerRecord.bankDetails?.ifscCode || '',
 accountHolderName: ownerRecord.bankDetails?.accountHolderName || '',
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
 setOwnerMode('new');
 let defaultRegFee = '';
 if (state.settings && state.settings.newBusinessRegistration) {
   if (state.settings.newBusinessRegistration.type === 'amount') {
     defaultRegFee = String(state.settings.newBusinessRegistration.value);
   }
 }

 setFormData({
 ...formData,
 businessId: generateBusinessId(),
 name: '',
 ownerName: '',
 fundingRequired: '',
 interestRate: '',
 bankName: INDIAN_BANKS[0],
 accountNumber: '',
 ifscCode: '',
 accountHolderName: '',
 registrationFee: defaultRegFee,
 });
 setViewMode('add-step-1');
 };

 const handleNextStep = (e: React.FormEvent) => {
 e.preventDefault();
 if (ownerMode === 'existing' && !formData.businessId) {
 alert("Please select an existing owner.");
 return;
 }
 if (!formData.name.trim() || !formData.ownerName.trim()) return;
 setFormData({
 ...formData,
 accountHolderName: formData.ownerName.toUpperCase() // auto fill all caps
 });
 setViewMode('add-step-2');
 };

 const handleVerifiedSave = (e: React.FormEvent) => {
 e.preventDefault();
 const fees = calculateFees();
 const newBusiness: Business = {
 id: `b${Date.now()}`,
 businessId: formData.businessId,
 name: formData.name,
 ownerName: formData.ownerName,
 authorityType: formData.authorityType,
 rmasSubsidy: (formData.authorityType === 'Government Authorities' || formData.authorityType === 'Trust Authorities') ? (Number(formData.rmasSubsidy) || 4) : 0,
 registrationDate: new Date().toISOString().split('T')[0],
 fundingRequired: parseFloat(formData.fundingRequired),
 interestRate: parseFloat(formData.interestRate),
 registrationCommissionPaid: fees.commission,
 taxPaid: fees.tax,
 status: 'listed',
 bankDetails: {
 bankName: formData.bankName,
 accountNumber: formData.accountNumber,
 ifscCode: formData.ifscCode.toUpperCase(),
 accountHolderName: formData.accountHolderName.toUpperCase()
 },
 registrationFee: Number(formData.registrationFee) || 0
 };

 dispatch({ type: 'ADD_BUSINESS', payload: newBusiness });
 setViewMode('list');
 };

 

 if (selectedBusinessId) {
 const businessForDetail = state.businesses.find(b => b.id === selectedBusinessId);
 return <BusinessDetail 
 businessId={selectedBusinessId} 
 onBack={() => setSelectedBusinessId(null)} 
 
 onDelete={() => {
          const id = selectedBusinessId;
          setSelectedBusinessId(null);
          setDeletingId(id);
          setTimeout(() => {
            dispatch({ type: 'DELETE_BUSINESS', payload: id });
            setDeletingId(null);
          }, 600);
        }}
 />;
 }

 return (
 <div className="max-w-6xl mx-auto space-y-6 print:m-0 print:p-0">
 <div className="print:hidden space-y-6">
 {viewMode === 'list' && (
 <>
 {/* Header Section */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 space-y-3 md:space-y-0 relative z-10">
 <div>
 <h2 className="text-[15px] md:text-xl font-medium text-kite-text tracking-tight uppercase">Businesses</h2>
 </div>
 <button onClick={startAddBusiness}
 className="bg-kite-blue hover:opacity-90 text-white px-4 h-[40px] md:h-[44px] rounded-md font-medium flex items-center justify-center space-x-2 transition-colors text-sm w-full md:w-auto shadow-sm"
 >
 <Plus className="w-4 h-4" />
 <span>Register Business</span>
 </button>
 </div>

 <div className="w-full bg-white border border-kite-border rounded-sm overflow-hidden sticky top-0 z-10">
 <div className="p-2 sm:p-3 border-b border-kite-border flex items-center bg-kite-bg">
 <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text-light mr-2" />
 <input type="text" placeholder="Search businesses by name, owner, or ID..." className="bg-transparent border-none outline-none w-full text-sm font-medium text-kite-text placeholder-gray-400"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="overflow-hidden">
 {/* Unified Watchlist View */}
 <div className="flex flex-col divide-y divide-kite-border">
 {filteredBusinesses.map(business => (
 <div key={`inv_${business.id}`} 
      onClick={() => setSelectedBusinessId(business.id)}
      className="flex items-center justify-between p-3 md:p-4 bg-white hover:bg-kite-bg cursor-pointer transition-colors min-h-[50px] md:min-h-[60px] group"
 >
   <div className="flex flex-col">
     <div className="flex items-center space-x-1.5 mb-0.5">
       <span className="font-medium text-kite-text text-sm md:text-base group-hover:text-kite-blue transition-colors">{business.name}</span>
       {isBlueTick(business.id) && <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0" />}
       {isPreVerified(business.id) && <Clock className="w-3 h-3 text-black flex-shrink-0" />}
     </div>
     <div className="flex items-center space-x-2">
       <span className="text-[11px] md:text-xs text-kite-text-light">Owner: {business.ownerName}</span>
       <span className="text-kite-border">•</span>
       <span className="font-mono text-[11px] md:text-xs text-kite-text-light">ID: #{business.businessId}</span>
     </div>
   </div>
   
   <div className="flex items-center space-x-3 md:space-x-6 text-right">
     <div className="flex flex-col items-end">
       <span className="font-medium text-kite-text text-sm">{formatINR(business.fundingRequired)}</span>
       <span className="text-[11px] font-medium mt-0.5 text-kite-green">
         {business.interestRate}% ROI
       </span>
     </div>
     <ChevronRight className="w-4 h-4 text-kite-text-light group-hover:text-kite-blue transition-colors flex-shrink-0 hidden md:block" />
   </div>
 </div>
 ))}
 {filteredBusinesses.length === 0 && (
 <div className="p-8 text-center text-kite-text-light font-medium text-sm">No businesses found.</div>
 )}
 </div>


 </div>
 </div>
 </>
 )}

 {viewMode === 'add-step-1' && (
 <div className="w-full max-w-xl mx-auto bg-white dark:bg-kite-surface md:border md:border-kite-border dark:md:border-kite-border md:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:md:shadow-none rounded-lg p-4 md:p-8">
 <div className="flex items-center mb-6 md:mb-8 border-b border-kite-border dark:border-kite-border pb-4">
   <button type="button" onClick={() => setViewMode('list')} className="p-1 -ml-1 mr-2 text-kite-text-light dark:text-kite-text-light hover:text-gray-800 dark:hover:text-kite-text transition-colors">
     <ArrowLeft className="w-5 h-5" />
   </button>
   <h3 className="text-base md:text-lg font-semibold text-kite-text dark:text-kite-text flex items-center space-x-2">
     <Building2 className="w-5 h-5 text-kite-text-light dark:text-kite-text-light" />
     <span>Step 1: Business Profile</span>
   </h3>
 </div>

 <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4 md:mb-6">
  <button
    type="button"
    onClick={() => {
      setOwnerMode('new');
      setFormData({ ...formData, businessId: generateBusinessId(), ownerName: '', bankName: INDIAN_BANKS[0], accountNumber: '', ifscCode: '', accountHolderName: '' });
    }}
    className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-sm font-medium transition-all duration-200 rounded border ${ownerMode === 'new' ? 'bg-[#387ed1] text-white border-[#387ed1]' : 'bg-white dark:bg-kite-bg text-gray-500 dark:text-kite-text border-kite-border dark:border-kite-border hover:bg-gray-50 dark:hover:bg-kite-border hover:brightness-105'}`}
  >
    New Business Owner
  </button>
  <button
    type="button"
    onClick={() => setOwnerMode('existing')}
    className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-sm font-medium transition-all duration-200 rounded border ${ownerMode === 'existing' ? 'bg-[#387ed1] text-white border-[#387ed1]' : 'bg-white dark:bg-kite-bg text-gray-500 dark:text-kite-text border-kite-border dark:border-kite-border hover:bg-gray-50 dark:hover:bg-kite-border-soft hover:brightness-105'}`}
  >
    Already Registered Owner
  </button>
 </div>

 <form onSubmit={handleNextStep} className="space-y-6">
 <AnimatePresence mode="wait">
   <motion.div
     key={ownerMode}
     initial={{ opacity: 0, y: 8 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -8 }}
     transition={{ duration: 0.2, ease: "easeOut" }}
     className="space-y-6"
   >
 <div className="grid grid-cols-1 gap-2 md:gap-4">
 {ownerMode === 'existing' && (
 <div className="relative z-20">
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Select Existing Owner</label>
 <div className="w-full border-0 border-b border-kite-border dark:border-kite-border py-2 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-[#387ed1]"
 onClick={() => {
 setShowOwnerSelect(!showOwnerSelect);
 setOwnerSearch('');
 }}
 >
 <span className="truncate text-sm md:text-base">
 {formData.businessId ? (
 <span className="font-medium text-gray-800 dark:text-kite-text">{formData.ownerName} <span className="font-normal text-gray-500 dark:text-kite-text-light ml-1 font-mono text-xs">(ID: #{formData.businessId})</span></span>
 ) : (
 <span className="text-gray-400 dark:text-gray-500 font-medium">Select an owner...</span>
 )}
 </span>
 <ChevronDown  className="w-4 h-4 text-gray-400 dark:text-gray-500" />
 </div>
 {showOwnerSelect && (
 <div className="absolute z-10 w-full mt-1 bg-white dark:bg-kite-surface border border-kite-border dark:border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col">
 <div className="p-2 border-b border-kite-border dark:border-kite-border bg-kite-bg dark:bg-kite-bg">
 <div className="relative">
 <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light dark:text-kite-text-light"  />
 <input type="text" autoFocus
 placeholder="Search owner..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-kite-border dark:border-kite-border bg-transparent text-kite-text dark:text-kite-text rounded-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
 value={ownerSearch}
 onChange={(e) => setOwnerSearch(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1">
 {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).map(b => (
 <div key={`opt_${b.id}`} className="px-4 py-3 hover:bg-kite-bg dark:hover:bg-kite-border-soft cursor-pointer flex flex-col border-b border-kite-border dark:border-kite-border last:border-0 transition-colors"
 onClick={() => {
 handleExistingOwnerChange({ target: { value: b.businessId } } as any);
 setShowOwnerSelect(false);
 }}
 >
 <span className="font-medium text-kite-text dark:text-kite-text">{b.ownerName}</span>
 <span className="text-xs text-kite-text-light dark:text-kite-text-light mt-0.5">ID: #{b.businessId}</span>
 </div>
 ))}
 {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).length === 0 && (
 <div className="px-4 py-3 text-sm text-kite-text-light dark:text-kite-text-light text-center">No owner found.</div>
 )}
 </div>
 </div>
 )}
 </div>
 )}

  <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Owner ID Number {ownerMode === 'new' ? '(Auto-Generated)' : '(Linked)'}</label>
 <input type="text" readOnly className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-mono text-gray-500 dark:text-kite-text-light cursor-not-allowed outline-none" value={formData.businessId} />
 </div>

 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Business Name</label>
 <input required type="text" autoFocus
 className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
 </div>

 {ownerMode === 'new' && (
 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Owner Name</label>
 <input required type="text" className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="e.g. John Doe" />
 </div>
 )}

 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Authority Type</label>
 <select
 className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors outline-none cursor-pointer"
 value={formData.authorityType}
 onChange={(e) => setFormData({...formData, authorityType: e.target.value as any})}
 required
 >
 <option value="Business Authorities">Business Authorities</option>
 <option value="Government Authorities">Government Authorities</option>
 <option value="Trust Authorities">Trust Authorities</option>
 </select>
 </div>

  {(formData.authorityType === 'Government Authorities' || formData.authorityType === 'Trust Authorities') && (
 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">RMAS Subsidy Rate (%)</label>
 <input required type="number" step="0.1"
 className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none" value={formData.rmasSubsidy} onChange={e => setFormData({...formData, rmasSubsidy: e.target.value})} placeholder="e.g. 4" />
 <p className="text-[11px] text-gray-500 dark:text-kite-text-light mt-1.5">RMAS will pay this percentage towards the interest when an investor withdraws.</p>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Funding Required (₹)</label>
 <input required type="text" inputMode="numeric"
 className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none" value={formData.fundingRequired ? Number(formData.fundingRequired.toString().replace(/\D/g, '')).toLocaleString('en-IN') : ''} onChange={e => setFormData({...formData, fundingRequired: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 5,00,000" />
 </div>
 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Interest Rate (%)</label>
 <input required type="number" step="0.1" min="0"
 className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} placeholder="e.g. 12.5" />
 </div>
 </div>

 {Number(formData.fundingRequired) > 0 && Number(formData.interestRate) > 0 && (
 <div className="mt-4 border border-kite-border rounded-sm overflow-hidden">
 <button type="button"
 onClick={() => setShowInterestCalculation(!showInterestCalculation)}
 className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:p-4 md:gap-2"
 >
 <span className="font-medium text-kite-text flex items-center space-x-2 min-w-0">
 <span className="truncate">Show Interest Return Breakdown</span>
 </span>
 <span className="text-kite-text-light text-xs md:text-base flex-shrink-0">{showInterestCalculation ? '−' : '+'}</span>
 </button>
 {showInterestCalculation && (
 <div className="p-2 md:p-4 bg-white border-t border-kite-border flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
 <div>
 <p className="text-sm font-medium text-kite-text">Calculated Return to Investor</p>
 <p className="text-xs text-kite-text-light mt-0.5">Based on <span className="font-medium text-kite-green">{formData.interestRate}%</span> interest rate applied on <span className="font-mono font-medium">{formatINR(Number(formData.fundingRequired))}</span>.</p>
 </div>
 <div className="text-left md:text-right flex flex-col gap-2 min-w-0">
 <p className="text-sm font-medium text-gray-500 dark:text-kite-text-light border border-kite-border dark:border-kite-border bg-kite-bg dark:bg-kite-bg px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Monthly Return: <span className="font-medium font-mono text-gray-800 dark:text-kite-text break-all">{formatINR((Number(formData.fundingRequired) * Number(formData.interestRate) / 100) / 12)}</span>
 </p>
 <p className="text-sm font-medium text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Yearly Return: <span className="font-medium font-mono text-green-900 dark:text-green-300 break-all">{formatINR(Number(formData.fundingRequired) * Number(formData.interestRate) / 100)}</span>
 </p>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </motion.div>
 </AnimatePresence>

 <div className="flex justify-between items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border">
 <button type="button" onClick={() => setViewMode('list')} className="px-2 py-2 text-sm font-medium text-gray-500 dark:text-kite-text-light hover:text-gray-800 dark:hover:text-kite-text transition-colors">Cancel</button>
 <button type="submit" className="bg-[#387ed1] hover:bg-[#2b65a8] text-white px-8 py-2.5 rounded shadow-sm font-medium transition-colors flex items-center justify-center min-w-[140px]">
   <span>Next Step</span>
   <ArrowRight className="w-4 h-4 ml-2" />
 </button>
 </div>
 </form>
 </div>
 )}

 {viewMode === 'add-step-2' && (
 <div className="w-full max-w-xl mx-auto bg-white dark:bg-kite-surface md:border md:border-kite-border dark:md:border-kite-border md:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:md:shadow-none rounded-lg p-4 md:p-8">
 <div className="flex items-center mb-6 md:mb-8 border-b border-kite-border dark:border-kite-border pb-4">
   <button type="button" onClick={() => setViewMode('add-step-1')} className="p-1 -ml-1 mr-2 text-gray-500 dark:text-kite-text-light hover:text-gray-800 dark:hover:text-kite-text transition-colors">
     <ArrowLeft className="w-5 h-5" />
   </button>
   <h3 className="text-base md:text-lg font-semibold text-kite-text dark:text-kite-text flex items-center space-x-2">
     <Banknote className="w-5 h-5 text-kite-text-light dark:text-kite-text-light" />
     <span>Step 2: Banking Process</span>
   </h3>
 </div>
 <form onSubmit={handleVerifiedSave} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider flex items-center space-x-1">
 <Building className="w-3.5 h-3.5" /> <span>Bank Name</span>
 </label>
 <select className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium outline-none transition-colors ${ownerMode === 'existing' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1] cursor-pointer'}`}
 value={formData.bankName}
 onChange={(e) => setFormData({...formData, bankName: e.target.value})}
 disabled={ownerMode === 'existing'}
 >
 {INDIAN_BANKS.map(bank => (
 <option key={bank} value={bank} className="bg-white dark:bg-kite-surface text-kite-text dark:text-kite-text">{bank}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Account Number</label>
 <input required type="text" className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-mono outline-none transition-colors ${ownerMode === 'existing' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1]'}`}
 value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 30291039482" readOnly={ownerMode === 'existing'}
 />
 </div>

 <div>
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">IFSC Code</label>
 <input required type="text" className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-mono uppercase outline-none transition-colors ${ownerMode === 'existing' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1]'}`}
 value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} placeholder="e.g. SBIN0001234" readOnly={ownerMode === 'existing'}
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Account Holder Name</label>
 <input required type="text" className={`w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium uppercase outline-none transition-colors ${ownerMode === 'existing' ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-800 dark:text-kite-text focus:ring-0 focus:border-[#387ed1]'}`}
 value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value.toUpperCase()})} readOnly={ownerMode === 'existing'}
 />
 {ownerMode === 'existing' ? (
 <p className="text-[11px] text-orange-600 mt-1.5 font-medium">Bank details are locked because this owner is already registered.</p>
 ) : (
 <p className="text-[11px] text-gray-500 dark:text-kite-text-light mt-1.5">Auto-filled from Step 1. You can edit if bank account name differs.</p>
 )}
 </div>
 </div>

 <div className="border-t border-kite-border dark:border-kite-border pt-6 mt-2">
 <label className="block text-[11px] font-medium mb-1 text-kite-text-light dark:text-kite-text-light uppercase tracking-wider">Registration Fee (₹)</label>
 <input required type="text" inputMode="numeric" className="w-full md:w-1/2 border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-sm md:text-base font-medium text-[#387ed1] focus:ring-0 focus:border-[#387ed1] outline-none transition-colors" value={formData.registrationFee ? Number(formData.registrationFee.toString().replace(/\D/g, '')).toLocaleString('en-IN') : ''} onChange={e => setFormData({...formData, registrationFee: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 10,000" />
 </div>

 <div className="flex justify-between items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border">
 <button type="button" onClick={() => setViewMode('add-step-1')} className="px-2 py-2 text-sm font-medium text-gray-500 dark:text-kite-text-light hover:text-gray-800 dark:hover:text-kite-text transition-colors">← Back</button>
 <button type="submit" className="bg-[#4caf50] hover:bg-[#43a047] text-white px-8 py-2.5 rounded shadow-sm font-medium transition-colors">✓ Verify & Register</button>
 </div>
 </form>
 </div>
  )}
  </div>
</div>
  );
}