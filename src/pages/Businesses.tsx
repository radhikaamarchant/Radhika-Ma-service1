import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, Search, Building2, Banknote, Building, X, BadgeCheck, ChevronDown, Clock } from 'lucide-react';
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

 const filteredBusinesses = state.businesses.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
 registrationFee: '',
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
 <div className="flex justify-between items-end">
 <div>
 <h2 className="text-xs md:text-base font-medium text-kite-text tracking-tight">Businesses</h2>
 <p className="text-sm text-kite-text-light mt-1">Manage registered businesses needing funding.</p>
 </div>
 <button onClick={startAddBusiness}
 className="bg-kite-blue hover:bg-kite-blue text-white px-4 py-2 rounded-sm font-medium flex items-center space-x-2 transition-colors"
 >
 <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
 <span>Register Business</span>
 </button>
 </div>

 <div className="w-full bg-white border border-kite-border rounded-sm overflow-hidden">
 <div className="p-2 md:p-4 border-b border-kite-border flex items-center bg-kite-bg">
 <Search  className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text-light mr-2" />
 <input type="text" placeholder="Search businesses by name, owner, or ID..." className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="overflow-hidden">
 {/* Desktop Table View */}
 <div className="hidden md:block overflow-x-auto w-full max-w-full">
 <table className="w-full text-left text-sm min-w-[1000px]">
 <thead>
 <tr className="border-b border-kite-border bg-white">
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text">ID Number</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text">Business Name</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text">Owner</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text">Funding Needed</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text">Interest</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text text-center">Live Trend</th>
 <th className="p-2 md:p-2 md:p-4 font-medium text-kite-text text-center">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredBusinesses.map(business => (
 <tr key={`desk_${business.id}`} className="border-b border-kite-border hover:bg-kite-bg">
 <td className="p-2 md:p-2 md:p-4 font-mono text-kite-text-light font-medium">#{business.businessId}</td>
 <td className="p-2 md:p-2 md:p-4 font-medium text-kite-text flex items-center space-x-1.5 h-full">
 <span>{business.name}</span>
 {isBlueTick(business.id) && <BadgeCheck  className="w-3 md:w-4 h-3 md:h-4 text-white fill-blue-500 flex-shrink-0" title="RMAS Verified - High Profit" />}
 {isPreVerified(business.id) && <Clock  className="w-3 md:w-4 h-3 md:h-4 text-black flex-shrink-0" title="Pre-Verified" />}
 </td>
 <td className="p-2 md:p-2 md:p-4 text-kite-text font-medium">{business.ownerName}</td>
 <td className="p-2 md:p-2 md:p-4 font-medium text-kite-text">{formatINR(business.fundingRequired)}</td>
 <td className="p-2 md:p-2 md:p-4 text-kite-green font-medium">{business.interestRate}%</td>
 <td className="p-2 md:p-2 md:p-4 text-center">
 <MarketTrendCell businessId={business.id} showIcon={true} />
 </td>
 <td className="p-2 md:p-2 md:p-4 text-center space-x-2 whitespace-nowrap">
 <button onClick={() => setSelectedBusinessId(business.id)}
 className="text-kite-text-light hover:text-kite-text font-medium text-xs px-3 py-1.5 border border-kite-border rounded-sm transition-colors w-full"
 >
 View
 </button>
 </td>
 </tr>
 ))}
 {filteredBusinesses.length === 0 && (
 <tr>
 <td colSpan={7} className="p-2 md:p-4 text-center text-kite-text-light font-medium">No businesses found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards View */}
 <div className="block md:hidden divide-y divide-gray-100">
 {filteredBusinesses.map(business => (
 <div key={`mob_${business.id}`} className="p-2 md:p-4 bg-white hover:bg-kite-bg">
 <div className="flex justify-between items-start mb-2">
 <div className="flex items-center space-x-1.5">
 <span className="font-medium text-kite-text text-xs md:text-base">{business.name}</span>
 {isBlueTick(business.id) && <BadgeCheck  className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-blue-500 flex-shrink-0" />}
 {isPreVerified(business.id) && <Clock  className="w-3.5 h-3.5 md:w-4 md:h-4 text-black flex-shrink-0" />}
 </div>
 <span className="font-mono text-xs text-kite-text-light bg-kite-bg px-2 py-1 rounded">#{business.businessId}</span>
 </div>
 <p className="text-sm text-kite-text font-medium mb-4">{business.ownerName}</p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:p-3 mb-4 bg-kite-bg p-1.5 md:p-3 rounded-sm">
 <div>
 <p className="text-xs text-kite-text-light mb-1">Funding Needed</p>
 <p className="font-medium text-sm">{formatINR(business.fundingRequired)}</p>
 </div>
 <div>
 <p className="text-xs text-kite-text-light mb-1">Interest</p>
 <p className="font-medium text-sm text-kite-green">{business.interestRate}%</p>
 </div>
 <div className="col-span-2 pt-2 border-t border-kite-border flex justify-between items-center">
 <div className="flex-1"></div>
 <div className="text-right flex-shrink-0">
 <p className="text-xs text-kite-text-light mb-1">Live Trend</p>
 <MarketTrendCell businessId={business.id} showIcon={true} />
 </div>
 </div>
 </div>

 <div className="flex space-x-2">
 <button onClick={() => setSelectedBusinessId(business.id)}
 className="flex-1 text-kite-text font-medium text-xs px-3 py-2 border border-kite-border rounded-sm text-center"
 >
 View
 </button>
 </div>
 </div>
 ))}
 {filteredBusinesses.length === 0 && (
 <div className="p-2 md:p-4 text-center text-kite-text-light font-medium">No businesses found.</div>
 )}
 </div>
 </div>
 </div>
 </>
 )}

 {viewMode === 'add-step-1' && (
 <div className="w-full max-w-2xl mx-auto bg-white border border-kite-border rounded-sm p-2 md:p-4 md:p-2 md:p-4">
 <h3 className="text-xs md:text-base font-medium text-kite-text mb-3 md:mb-6 flex items-center space-x-2">
 <Building2  className="w-4 h-4 md:w-5 md:h-5 text-kite-text" />
 <span>Step 1: Business Profile</span>
 </h3>

 <div className="flex bg-kite-bg p-1 rounded-sm mb-3 md:mb-6">
 <button
 type="button"
 onClick={() => {
 setOwnerMode('new');
 setFormData({ ...formData, businessId: generateBusinessId(), ownerName: '', bankName: INDIAN_BANKS[0], accountNumber: '', ifscCode: '', accountHolderName: '' });
 }}
 className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${ownerMode === 'new' ? 'bg-white text-kite-text' : 'text-kite-text-light hover:text-kite-text'}`}
 >
 New Business Owner
 </button>
 <button
 type="button"
 onClick={() => setOwnerMode('existing')}
 className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${ownerMode === 'existing' ? 'bg-white text-kite-text' : 'text-kite-text-light hover:text-kite-text'}`}
 >
 Already Registered Owner
 </button>
 </div>

 <form onSubmit={handleNextStep} className="space-y-6">
 <div className="grid grid-cols-1 gap-2 md:gap-4">
 {ownerMode === 'existing' && (
 <div className="relative z-20">
 <label className="block text-sm font-medium mb-2 text-kite-text">Select Existing Owner</label>
 <div className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 bg-white cursor-pointer flex justify-between items-center"
 onClick={() => {
 setShowOwnerSelect(!showOwnerSelect);
 setOwnerSearch('');
 }}
 >
 <span className="truncate">
 {formData.businessId ? (
 <span className="font-medium text-kite-text">{formData.ownerName} <span className="font-normal text-kite-text-light ml-1">(ID: #{formData.businessId})</span></span>
 ) : (
 <span className="text-kite-text-light">Select an owner...</span>
 )}
 </span>
 <ChevronDown  className="w-3 md:w-4 h-3 md:h-4 text-kite-text-light" />
 </div>
 {showOwnerSelect && (
 <div className="absolute z-10 w-full mt-1 bg-white border border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col">
 <div className="p-2 border-b border-kite-border bg-kite-bg">
 <div className="relative">
 <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light"  />
 <input type="text" autoFocus
 placeholder="Search owner..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-kite-border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
 value={ownerSearch}
 onChange={(e) => setOwnerSearch(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1">
 {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).map(b => (
 <div key={`opt_${b.id}`} className="px-4 py-3 hover:bg-kite-bg cursor-pointer flex flex-col border-b border-kite-border last:border-0 transition-colors"
 onClick={() => {
 handleExistingOwnerChange({ target: { value: b.businessId } } as any);
 setShowOwnerSelect(false);
 }}
 >
 <span className="font-medium text-kite-text">{b.ownerName}</span>
 <span className="text-xs text-kite-text-light mt-0.5">ID: #{b.businessId}</span>
 </div>
 ))}
 {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).length === 0 && (
 <div className="px-4 py-3 text-sm text-kite-text-light text-center">No owner found.</div>
 )}
 </div>
 </div>
 )}
 </div>
 )}

 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Owner ID Number {ownerMode === 'new' ? '(Auto-Generated)' : '(Linked)'}</label>
 <input type="text" readOnly className="w-full border border-kite-border bg-kite-bg text-kite-text-light font-mono rounded-sm p-1.5 md:p-3 outline-none cursor-not-allowed" value={formData.businessId} />
 </div>

 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Business Name</label>
 <input required type="text" autoFocus
 className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 text-xs md:text-base font-medium focus:ring-2 focus:ring-black outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
 </div>

 {ownerMode === 'new' && (
 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Owner Name</label>
 <input required type="text" className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-medium focus:ring-2 focus:ring-black outline-none" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="e.g. John Doe" />
 </div>
 )}

 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Authority Type</label>
 <select
 className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-medium focus:ring-2 focus:ring-black outline-none bg-white"
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
 <label className="block text-sm font-medium mb-2 text-kite-text">RMAS Subsidy Rate (%)</label>
 <input required type="number" step="0.1"
 className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-medium focus:ring-2 focus:ring-black outline-none" value={formData.rmasSubsidy} onChange={e => setFormData({...formData, rmasSubsidy: e.target.value})} placeholder="e.g. 4" />
 <p className="text-xs text-kite-text-light mt-1">RMAS will pay this percentage towards the interest when an investor withdraws.</p>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2">
 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Funding Required (₹)</label>
 <input required type="number" min="0"
 className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 focus:ring-2 focus:ring-black outline-none" value={formData.fundingRequired} onChange={e => setFormData({...formData, fundingRequired: e.target.value})} placeholder="e.g. 500000" />
 </div>
 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Interest Rate (%)</label>
 <input required type="number" step="0.1" min="0"
 className="w-full border border-kite-border rounded-sm p-1.5 md:p-3 focus:ring-2 focus:ring-black outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} placeholder="e.g. 12.5" />
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
 <p className="text-sm font-medium text-kite-text-light border border-kite-border bg-kite-bg px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Monthly Return: <span className="font-medium font-mono text-kite-text break-all">{formatINR((Number(formData.fundingRequired) * Number(formData.interestRate) / 100) / 12)}</span>
 </p>
 <p className="text-sm font-medium text-green-800 border border-kite-green/30 bg-kite-green/10 px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Yearly Return: <span className="font-medium font-mono text-green-900 break-all">{formatINR(Number(formData.fundingRequired) * Number(formData.interestRate) / 100)}</span>
 </p>
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="flex justify-between pt-6 border-t border-kite-border">
 <button type="button" onClick={() => setViewMode('list')} className="px-6 py-2.5 font-medium text-kite-text-light hover:text-kite-text">Cancel</button>
 <button type="submit" className="bg-kite-blue hover:bg-kite-blue text-white px-8 py-2.5 rounded-sm font-medium transition-colors">Next Page →</button>
 </div>
 </form>
 </div>
 )}

 {viewMode === 'add-step-2' && (
 <div className="w-full max-w-3xl mx-auto bg-white border border-kite-border rounded-sm p-2 md:p-4 md:p-2 md:p-4">
 <h3 className="text-xs md:text-base font-medium text-kite-text mb-3 md:mb-6 flex items-center space-x-2">
 <Banknote  className="w-4 h-4 md:w-5 md:h-5 text-kite-text" />
 <span>Step 2: BANKING PROCESS</span>
 </h3>
 <form onSubmit={handleVerifiedSave} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2">
 <div className="md:col-span-2">
 <label className="block text-sm font-medium mb-2 text-kite-text flex items-center space-x-1">
 <Building className="w-3 md:w-4 h-3 md:h-4" /> <span>Bank Name</span>
 </label>
 <select className={`w-full border border-kite-border rounded-sm p-1.5 md:p-3 outline-none font-medium ${ownerMode === 'existing' ? 'bg-kite-bg text-kite-text-light cursor-not-allowed' : 'focus:ring-2 focus:ring-black bg-white'}`}
 value={formData.bankName}
 onChange={(e) => setFormData({...formData, bankName: e.target.value})}
 disabled={ownerMode === 'existing'}
 >
 {INDIAN_BANKS.map(bank => (
 <option key={bank} value={bank}>{bank}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">Account Number</label>
 <input required type="text" className={`w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-mono outline-none ${ownerMode === 'existing' ? 'bg-kite-bg text-kite-text-light cursor-not-allowed' : 'focus:ring-2 focus:ring-black'}`}
 value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 30291039482" readOnly={ownerMode === 'existing'}
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-2 text-kite-text">IFSC Code</label>
 <input required type="text" className={`w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-mono uppercase outline-none ${ownerMode === 'existing' ? 'bg-kite-bg text-kite-text-light cursor-not-allowed' : 'focus:ring-2 focus:ring-black'}`}
 value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} placeholder="e.g. SBIN0001234" readOnly={ownerMode === 'existing'}
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-medium mb-2 text-kite-text">Account Holder Name</label>
 <input required type="text" className={`w-full border border-kite-border rounded-sm p-1.5 md:p-3 font-medium uppercase outline-none ${ownerMode === 'existing' ? 'bg-kite-bg text-kite-text-light cursor-not-allowed' : 'bg-white text-kite-text focus:ring-2 focus:ring-black'}`}
 value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value.toUpperCase()})} readOnly={ownerMode === 'existing'}
 />
 {ownerMode === 'existing' ? (
 <p className="text-xs text-black mt-2 font-medium">Bank details are locked because this owner is already registered.</p>
 ) : (
 <p className="text-xs text-kite-text-light mt-2">Auto-filled from Step 1. You can edit if bank account name differs.</p>
 )}
 </div>
 </div>

 <div className="border-t border-kite-border pt-6">
 <label className="block text-sm font-medium mb-2 text-kite-text">Registration Fee (₹)</label>
 <input required type="number" className="w-full md:w-1/2 border border-blue-300 bg-kite-blue/10/50 rounded-sm p-1.5 md:p-3 font-medium text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} placeholder="Enter amount..." />
 </div>

 <div className="flex justify-between pt-6 border-t border-kite-border">
 <button type="button" onClick={() => setViewMode('add-step-1')} className="px-6 py-2.5 font-medium text-kite-text-light hover:text-kite-text">← Back</button>
 <button type="submit" className="bg-kite-green hover:bg-kite-green text-kite-text px-8 py-2.5 rounded-sm font-medium transition-colors">✓ Verified Business</button>
 </div>
 </form>
 </div>
 )}
 </div>

 
  </div>
  );
}