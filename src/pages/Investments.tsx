import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, ReceiptIndianRupee, Search, X, CheckCircle, Wallet, BadgeCheck, ChevronDown, ArrowLeft } from 'lucide-react';
import { Investment, Business, Investor } from '../types';
import { getBlueTickBusinessIds } from '../utils/blueTick';
import { getBaseMarketTrend } from '../utils/marketSimulator';
import { useMarketSimulation } from '../utils/MarketSimulationContext';
import { motion, AnimatePresence } from 'motion/react';
import { SwipeButton } from '../components/SwipeButton';

export default function Investments() {
 const { state, dispatch } = useAppContext();
 const { marketState } = useMarketSimulation();
 const blueTickBusinessIds = getBlueTickBusinessIds(state.businesses, state.investments);
 const [showAddForm, setShowAddForm] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);
 const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<string[]>([]);
 const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [withdrawFormData, setWithdrawFormData] = useState({
    completedMonths: '12',
    rmasCommission: '',
    happyIncomeTax: ''
  });

 const [showBusinessSelect, setShowBusinessSelect] = useState(false);
 const [showInvestorSelect, setShowInvestorSelect] = useState(false);
 const [businessSearch, setBusinessSearch] = useState('');
 const [investorSearch, setInvestorSearch] = useState('');
 const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
 const [successData, setSuccessData] = useState<{businessName: string, investorName: string, amount: number} | null>(null);

 const [formData, setFormData] = useState({
 businessId: '',
 investorId: '',
 amount: '',
 timePeriodMonths: '12',
 adminCommissionInvestorPct: '2',
 adminCommissionBusinessPct: '2',
 });

 const selectedBusiness = state.businesses.find(b => b.id === formData.businessId);
 const selectedBusinessInterest = selectedBusiness ? selectedBusiness.interestRate : 0;

 const getRawAmount = (formattedValue: string) => {
 return parseFloat(formattedValue.replace(/,/g, '')) || 0;
 };

 const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const raw = e.target.value.replace(/\D/g, '');
 const formatted = raw ? Number(raw).toLocaleString('en-IN') : '';
 setFormData({...formData, amount: formatted});
 };

 const calculateCommissions = () => {
 const amount = getRawAmount(formData.amount);
 const invPct = parseFloat(formData.adminCommissionInvestorPct) || 0;
 const busPct = parseFloat(formData.adminCommissionBusinessPct) || 0;
 return {
 fromInvestor: (amount * invPct) / 100,
 fromBusiness: (amount * busPct) / 100,
 };
 };

 const handleAddSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedBusiness || !formData.investorId) {
 alert("Please select both a business and an investor.");
 return;
 }

 const amount = getRawAmount(formData.amount);
 if (amount <= 0) return;

 const selectedInvestor = state.investors.find(i => i.id === formData.investorId);

 const comms = calculateCommissions();
 const startDate = new Date();
 const endDate = new Date();
 endDate.setMonth(endDate.getMonth() + parseInt(formData.timePeriodMonths));

 const newInvestment: Investment = {
 id: `inv${Date.now()}`,
 businessId: formData.businessId,
 investorId: formData.investorId,
 amount: amount,
 timePeriodMonths: parseInt(formData.timePeriodMonths),
 interestRate: selectedBusinessInterest,
 startDate: startDate.toISOString().split('T')[0],
 endDate: endDate.toISOString().split('T')[0],
 adminCommissionInvestor: comms.fromInvestor,
 adminCommissionBusiness: comms.fromBusiness,
 status: 'active',
 };

 setIsBooking(true);
    setTimeout(() => {
      dispatch({ type: 'ADD_INVESTMENT', payload: newInvestment });
      if (amount >= selectedBusiness.fundingRequired) {
        dispatch({ type: 'UPDATE_BUSINESS_STATUS', payload: { id: formData.businessId, status: 'funded' } });
      }

      setSuccessData({
        businessName: selectedBusiness.name,
        investorName: selectedInvestor ? selectedInvestor.name : 'Unknown Investor',
        amount: amount
      });
      setIsBooking(false);
      setShowSuccessAnimation(true);
      setShowAddForm(false);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSuccessData(null);
        setFormData({ businessId: '', investorId: '', amount: '', timePeriodMonths: '12', adminCommissionInvestorPct: '2', adminCommissionBusinessPct: '2' });
      }, 3000);
    }, 600);
 };

 const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;

  const getActiveInvestmentCount = (investorId: string) => {
    if (!formData.businessId) return 0;
    return state.investments.filter(i => i.investorId === investorId && i.businessId === formData.businessId && i.status === 'active').length;
  };
  
  const [isBooking, setIsBooking] = useState(false);

 const filteredInvestments = state.investments.filter(inv => {
 const business = state.businesses.find(b => b.id === inv.businessId);
 const investor = state.investors.find(i => i.id === inv.investorId);
 const match = searchTerm.toLowerCase();
 return business?.name.toLowerCase().includes(match) || investor?.name.toLowerCase().includes(match);
 }).sort((a, b) => getTime(b.id) - getTime(a.id));

 const groupedInvestments = Object.values(filteredInvestments.reduce((acc, inv) => {
    const key = `${inv.businessId}_${inv.investorId}_${inv.status}`;
    if (!acc[key]) {
      acc[key] = { ...inv, key: key, groupedIds: [inv.id], isGrouped: true, groupedInvestmentsList: [inv] };
    } else {
      acc[key].amount += inv.amount;
      acc[key].groupedIds.push(inv.id);
      acc[key].groupedInvestmentsList.push(inv);
    }
    return acc;
  }, {} as Record<string, any>));

 const activeBusinesses = state.businesses.slice().sort((a, b) => getTime(b.id) - getTime(a.id));
 const sortedInvestors = state.investors.slice().sort((a, b) => getTime(b.id) - getTime(a.id));

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4 ${showAddForm ? 'hidden md:flex' : 'flex'}`}>
 <div className="flex-1">
 <h2 className="text-xl md:text-base font-medium text-kite-text tracking-tight">Funding & Investments</h2>
 <p className="text-sm text-kite-text-light mt-1">Connect investors with businesses and collect commissions.</p>
 </div>
 <div className="flex-1 w-full flex justify-end gap-2 md:gap-4">
 <div className="relative w-full max-w-sm">
 <Search className="w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-kite-text-light"  />
 <input type="text"
 placeholder="Search by business or investor..."
 className="w-full pl-10 pr-4 py-2 border border-kite-border rounded-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 </div>
 <button onClick={() => setShowAddForm(!showAddForm)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-sm font-medium flex items-center space-x-1 md:space-x-2 transition-colors whitespace-nowrap shadow-sm text-xs md:text-sm"
  >
 <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
 <span className="hidden md:inline">New Funding Link</span>
 <span className="md:hidden">Add Invest</span>
 </button>
 </div>
 </div>

   {showAddForm && (
    <div className="w-full max-w-2xl mx-auto bg-white md:border md:border-gray-100 md:rounded md:shadow-sm p-4 md:p-10 animate-fade-in mt-2 md:mt-4 md:mb-8 relative overflow-hidden h-[calc(100vh-60px)] md:h-auto z-50 fixed inset-0 md:static md:z-0 flex flex-col pt-12 md:pt-10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 hidden md:block">
        <div className="h-full bg-blue-500 w-full transition-all duration-300"></div>
      </div>
      <div className="text-center mb-6 md:mb-8 shrink-0">
        <button type="button" onClick={() => setShowAddForm(false)} className="text-blue-500 mb-2 md:mb-4 inline-block hover:bg-blue-50 p-1.5 rounded transition-colors absolute top-4 left-4 md:top-6 md:left-6">
          <ArrowLeft className="w-5 h-5 md:hidden" />
          <X className="hidden md:block w-6 h-6" />
        </button>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Book new investment</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Fund a business and collect commission</p>
      </div>
      <form onSubmit={handleAddSubmit} className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pb-20 md:pb-0 hide-scrollbar px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
 <div className="relative group">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors"><span className="md:hidden">choose Business</span><span className="hidden md:inline">Select Business</span></label>
 <div className="w-full border-b-2 border-gray-200 p-2 md:p-3 bg-transparent text-base md:text-lg font-medium focus:border-blue-500 outline-none transition-colors cursor-pointer flex justify-between items-center"
 onClick={() => {
 setShowBusinessSelect(!showBusinessSelect);
 setShowInvestorSelect(false);
 setBusinessSearch('');
 }}
 >
 <span className="truncate">
 {selectedBusiness ? (
 <span className="flex items-center space-x-2">
 <span className="font-medium">{selectedBusiness.name}</span>
 <span className="text-kite-text-light text-xs">(Requires {formatINR(selectedBusiness.fundingRequired)})</span>
 {blueTickBusinessIds.has(selectedBusiness.id) && <BadgeCheck  className="w-3 md:w-4 h-3 md:h-4 text-white fill-blue-500 flex-shrink-0" title="RMAS Verified" />}
 </span>
 ) : (
 <span className="text-kite-text-light">-- Select Business --</span>
 )}
 </span>
 <ChevronDown  className="w-3 md:w-4 h-3 md:h-4 text-kite-text-light" />
 </div>
 {showBusinessSelect && (
 <div className="absolute z-10 w-full mt-1 bg-white border border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col">
 <div className="p-2 border-b border-kite-border bg-kite-bg">
 <div className="relative">
 <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light"  />
 <input type="text" autoFocus
 placeholder="Search business..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-kite-border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
 value={businessSearch}
 onChange={(e) => setBusinessSearch(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1">
 {activeBusinesses.filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(businessSearch.toLowerCase())).map(b => (
 <div key={b.id} className="px-4 py-3 hover:bg-kite-bg cursor-pointer flex flex-col border-b border-kite-border last:border-0 transition-colors"
 onClick={() => {
 const reqFundFormatted = b.fundingRequired ? b.fundingRequired.toLocaleString('en-IN') : '';
 setFormData({...formData, businessId: b.id, amount: reqFundFormatted});
 setShowBusinessSelect(false);
 }}
 >
 <div className="flex items-center space-x-2">
 <span className="font-medium text-kite-text">{b.name}</span>
 {blueTickBusinessIds.has(b.id) && <BadgeCheck  className="w-3 md:w-4 h-3 md:h-4 text-white fill-blue-500" title="RMAS Verified" />}
 </div>
 <span className="text-xs text-kite-text-light mt-0.5">Requires {formatINR(b.fundingRequired)} • ID: #{b.businessId}</span>
 </div>
 ))}
 {activeBusinesses.filter(b => b.name.toLowerCase().includes(businessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(businessSearch.toLowerCase())).length === 0 && (
 <div className="px-4 py-3 text-sm text-kite-text-light text-center">No business found.</div>
 )}
 </div>
 </div>
 )}
 </div>
 <div className="relative group mt-2 md:mt-0">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors"><span className="md:hidden">choose Investor</span><span className="hidden md:inline">Select Investor</span></label>
 <div className="w-full border-b-2 border-gray-200 p-2 md:p-3 bg-transparent text-base md:text-lg font-medium focus:border-blue-500 outline-none transition-colors cursor-pointer flex justify-between items-center"
 onClick={() => {
 setShowInvestorSelect(!showInvestorSelect);
 setShowBusinessSelect(false);
 setInvestorSearch('');
 }}
 >
 <span className="truncate">
 {formData.investorId ? (
 <span className="font-medium text-kite-text">{state.investors.find(i => i.id === formData.investorId)?.name}</span>
 ) : (
 <span className="text-kite-text-light">-- Select Investor --</span>
 )}
 </span>
 <ChevronDown  className="w-3 md:w-4 h-3 md:h-4 text-kite-text-light" />
 </div>
 {showInvestorSelect && (
 <div className="absolute z-10 w-full mt-1 bg-white border border-kite-border rounded-sm max-h-60 overflow-hidden flex flex-col">
 <div className="p-2 border-b border-kite-border bg-kite-bg">
 <div className="relative">
 <Search className="w-3 md:w-3.5 h-3 md:h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light"  />
 <input type="text" autoFocus
 placeholder="Search investor..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-kite-border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
 value={investorSearch}
 onChange={(e) => setInvestorSearch(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1">
 {sortedInvestors.filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(investorSearch.toLowerCase())).map(i => (
 <div key={i.id} className="px-4 py-3 hover:bg-kite-bg cursor-pointer flex flex-col border-b border-kite-border last:border-0 transition-colors"
                          onClick={() => {
                            setFormData({...formData, investorId: i.id});
                            setShowInvestorSelect(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
<span className="font-medium text-kite-text">{i.name}</span>
                            {getActiveInvestmentCount(i.id) > 0 && (
                               <span className="text-[10px] bg-kite-blue/10 text-kite-blue font-medium px-1.5 py-0.5 rounded-sm">pending {getActiveInvestmentCount(i.id)}</span>
                            )}
                          </div>
                          <span className="text-xs text-kite-text-light mt-0.5">ID: #{i.investorId}</span>
                        </div>
 ))}
 {sortedInvestors.filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(investorSearch.toLowerCase())).length === 0 && (
 <div className="px-4 py-3 text-sm text-kite-text-light text-center">No investor found.</div>
 )}
 </div>
 </div>
 )}
 </div>
 <div className="group">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors"><span className="md:hidden">invest amount ₹</span><span className="hidden md:inline">Investment Amount (₹) (INR Format)</span></label>
 <div className="relative">
 <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 font-medium text-kite-text-light">₹</span>
 <input required type="text" className="w-full border-b-2 border-gray-200 pl-6 md:pl-8 pr-2 md:pr-3 py-2 md:py-3 text-base md:text-lg font-medium focus:border-blue-500 outline-none transition-colors" value={formData.amount} onChange={handleAmountChange} placeholder="e.g. 5,00,000" />
 </div>
 </div>
 <div className="group">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors">Time Period (Months)</label>
 <input required type="number" min="1" className="w-full border-b-2 border-gray-200 p-2 md:p-3 text-base md:text-lg font-medium focus:border-blue-500 outline-none transition-colors" value={formData.timePeriodMonths} onChange={e => setFormData({...formData, timePeriodMonths: e.target.value})} />
 </div>
 </div>

 {selectedBusiness && (
 <div className="mt-4 border border-kite-green/30 rounded-sm overflow-hidden">
 <button type="button"
 onClick={() => setShowInterestCalculation(!showInterestCalculation)}
 className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:p-4 md:gap-2"
 >
 <span className="font-medium text-green-800 flex items-center space-x-2 min-w-0">
 <span className="truncate">Business Interest Rate: {selectedBusinessInterest}%</span>
 </span>
 <span className="text-kite-green text-xs md:text-base flex-shrink-0">{showInterestCalculation ? '−' : '+'}</span>
 </button>
 {showInterestCalculation && getRawAmount(formData.amount) > 0 && (
 <div className="p-2 md:p-4 bg-white border-t border-kite-green/30 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
 <div>
 <p className="text-sm font-medium text-kite-text">Calculated Return to Investor</p>
 <p className="text-xs text-kite-text-light mt-0.5">Based on <span className="font-medium text-kite-green">{selectedBusinessInterest}%</span> interest rate applied on <span className="font-mono font-medium">{formatINR(getRawAmount(formData.amount))}</span>.</p>
 </div>
 <div className="text-left md:text-right flex flex-col gap-2 min-w-0">
 <p className="text-sm font-medium text-kite-text-light border border-kite-border bg-kite-bg px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Monthly Return: <span className="font-medium font-mono text-kite-text break-all">{formatINR((getRawAmount(formData.amount) * selectedBusinessInterest / 100) / 12)}</span>
 </p>
 <p className="text-sm font-medium text-green-800 border border-kite-green/30 bg-kite-green/10 px-3 py-1.5 rounded-sm break-words whitespace-normal">
 Yearly Return: <span className="font-medium font-mono text-green-900 break-all">{formatINR(getRawAmount(formData.amount) * selectedBusinessInterest / 100)}</span>
 </p>
 </div>
 </div>
 )}
 </div>
 )}

 <div className="border-t border-kite-border pt-4 mt-3 md:mt-6">
 <h4 className="text-sm font-medium mb-1 md:mb-3 text-kite-red"><span className="md:hidden">RMAS NT Security Charge</span><span className="hidden md:inline">Admin Commission Processing</span></h4>
 <p className="hidden md:block text-xs text-kite-text-light mb-4">Set percentage to collect commission from both parties at the time of funding.</p>
 <div className="grid grid-cols-1 md:grid-cols-2">
 <div className="flex gap-2 md:gap-4">
 <div className="flex-1 group">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors"><span className="md:hidden">Business NTSC %</span><span className="hidden md:inline">From Business (%)</span></label>
 <input type="number" step="0.1" className="w-full border-b-2 border-gray-200 p-2 md:p-3 font-medium focus:border-blue-500 outline-none transition-colors" value={formData.adminCommissionBusinessPct} onChange={e => setFormData({...formData, adminCommissionBusinessPct: e.target.value})} />
 </div>
 <div className="flex-1 flex flex-col justify-end pb-2">
 <span className="text-sm font-medium text-kite-red">{formatINR(calculateCommissions().fromBusiness)}</span>
 </div>
 </div>
 <div className="flex gap-2 mt-4 pt-4 md:mt-0 md:pt-0 md:p-4 border-t md:border-t-0 md:border-l border-kite-border pl-0 md:pl-4">
 <div className="flex-1 group">
  <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 md:mb-2 group-focus-within:text-blue-500 transition-colors"><span className="md:hidden">Investor NTSC %</span><span className="hidden md:inline">From Investor (%)</span></label>
 <input type="number" step="0.1" className="w-full border-b-2 border-gray-200 p-2 md:p-3 font-medium focus:border-blue-500 outline-none transition-colors" value={formData.adminCommissionInvestorPct} onChange={e => setFormData({...formData, adminCommissionInvestorPct: e.target.value})} />
 </div>
 <div className="flex-1 flex flex-col justify-end pb-2">
 <span className="text-sm font-medium text-kite-red">{formatINR(calculateCommissions().fromInvestor)}</span>
 </div>
 </div>
 </div>
 <div className="text-right mt-3 md:mt-2">
 <p className="text-base md:text-sm font-medium">
    <span className="hidden md:inline text-kite-red">Total Admin Profit: {formatINR(calculateCommissions().fromBusiness + calculateCommissions().fromInvestor)}</span>
    <span className="md:hidden text-kite-text-light text-xs font-bold uppercase tracking-wider flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
        Total
        <span className="text-kite-green text-lg">{formatINR(calculateCommissions().fromBusiness + calculateCommissions().fromInvestor)}</span>
    </span>
 </p>
 </div>
 </div>

 
  <div className="pt-4 md:pt-6 mt-2 pb-6 md:pb-0">
    <button type="submit" disabled={isBooking} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white py-4 rounded text-sm md:text-base font-semibold tracking-wide transition-all shadow-md hover:shadow-lg relative overflow-hidden group">
      <span className={"relative z-10 flex items-center justify-center " + (isBooking ? 'opacity-0' : 'opacity-100')}>Book Investment</span>
      {isBooking && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
    </button>
    <button type="button" onClick={() => setShowAddForm(false)} className="w-full mt-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Cancel Booking</button>
  </div>
  </form>

 </div>
 )}

 
    <div className={`bg-white border border-kite-border rounded-sm overflow-hidden ${showAddForm ? 'hidden md:block' : 'block'}`}>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal table-fixed md:table-auto">
        <thead className="bg-kite-bg">
          <tr className="text-xs text-kite-text-light border-b border-kite-border/50">
            <th className="py-2 px-3 md:px-4 font-normal w-2/3 md:w-auto">Instrument</th>
            <th className="py-2 px-4 font-normal hidden md:table-cell">Investor</th>
            <th className="py-2 px-4 font-normal text-right hidden md:table-cell">Capital</th>
            <th className="py-2 px-4 font-normal text-right hidden md:table-cell">Cur. val</th>
            <th className="py-2 px-3 md:px-4 font-normal text-right w-1/3 md:w-auto">P&L</th>
            <th className="py-2 px-4 font-normal text-right hidden md:table-cell">Mkt Trend</th>
            <th className="py-2 px-4 font-normal text-center hidden md:table-cell">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kite-border/50">
          {groupedInvestments.map((inv: any) => {
            const business = state.businesses.find(b => b.id === inv.businessId);
            const investor = state.investors.find(i => i.id === inv.investorId);
            
            const trend = business ? getBaseMarketTrend(business, state.investments) : 0;
            const liveTrend = marketState.trends[inv.businessId] || 0;
            const overallTrend = trend + liveTrend;
            
            const isCompleted = inv.status === 'completed';
            const actualProfit = isCompleted && inv.payoutDetails 
              ? (inv.payoutDetails.totalCredited + (inv.payoutDetails.rmasCommission || 0) + (inv.payoutDetails.happyIncomeTax || 0) - inv.amount) 
              : 0;
            const expectedFixedProfit = (inv.amount * inv.interestRate / 100);
            
            const holdingProfit = isCompleted ? actualProfit : (inv.amount * overallTrend / 100);
            const curValue = inv.amount + holdingProfit;
            const pnlPercentage = isCompleted ? (holdingProfit / inv.amount) * 100 : overallTrend;
            const isProfit = holdingProfit >= 0;
            
            return (
              <tr key={inv.key} className="hover:bg-kite-bg/50 transition-colors cursor-pointer" onClick={() => {
                setSelectedInvestment(inv);
                setSelectedInvestmentIds(inv.groupedInvestmentsList.map((i: any) => i.id));
                setWithdrawStep(0);
              }}>
                <td className="py-3 px-3 md:px-4 overflow-hidden">
                  <p className="font-medium text-kite-text flex items-center pr-2 gap-1 text-xs md:text-sm">
                    <span className="truncate">{business?.name}</span>
                    {business && blueTickBusinessIds.has(business.id) && <BadgeCheck  className="w-3 h-3 md:w-3.5 md:h-3.5 text-white fill-blue-500 flex-shrink-0" title="RMAS Verified" />}
                  </p>
                  <p className="md:hidden text-[10px] text-kite-text-light truncate mt-0.5">{investor?.name}</p>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <p className="text-xs text-kite-text-light">{investor?.name}</p>
                </td>
                <td className="py-3 px-4 text-right hidden md:table-cell">
                  <p className="font-normal text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(inv.amount)}</p>
                </td>
                <td className="py-3 px-4 text-right hidden md:table-cell">
                  <p className="font-medium text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(curValue)}</p>
                </td>
                <td className={"py-3 px-3 md:px-4 text-right font-medium " + (isCompleted ? 'text-kite-blue' : isProfit ? 'text-kite-green' : 'text-kite-red')}>
                  <div className="flex flex-col items-end">
                    <p className="text-xs md:text-sm" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{isProfit && !isCompleted ? '+' : ''}{formatINR(holdingProfit)}</p>
                    <p className="text-[9px] md:text-[10px] opacity-80">{isProfit && !isCompleted ? '+' : ''}{pnlPercentage.toFixed(2)}%</p>
                  </div>
                </td>
                <td className={"py-3 px-4 text-right font-medium hidden md:table-cell " + (overallTrend >= 0 ? 'text-kite-green' : 'text-kite-red')}>
                  {overallTrend >= 0 ? '+' : ''}{overallTrend.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-center hidden md:table-cell">
                  <span className={"inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-medium " + (isCompleted ? 'bg-kite-blue/10 text-kite-blue' : 'bg-kite-green/10 text-kite-green')}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            );
          })}
          {groupedInvestments.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-kite-text-light text-sm">
                No investments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Details Modal */}
  {selectedInvestment && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-sm md:rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-kite-border p-3 md:p-5 flex justify-between items-center z-10">
          <h3 className="font-medium text-xs md:text-base text-kite-text flex items-center space-x-2">
            <Wallet className="w-4 h-4 md:w-6 md:h-6 text-kite-blue" />
            <span>Live Portfolio Details</span>
          </h3>
          <button onClick={() => setSelectedInvestment(null)}
            className="p-2 hover:bg-kite-bg rounded-full text-kite-text-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:hidden" />
            <X className="hidden md:block w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          {(() => {
            const business = state.businesses.find(b => b.id === selectedInvestment.businessId);
            const investor = state.investors.find(i => i.id === selectedInvestment.investorId);
            const trend = business ? getBaseMarketTrend(business, state.investments) : 0;
            const liveTrend = marketState.trends[selectedInvestment.businessId] || 0;
            const overallTrend = trend + liveTrend;
            
            const isCompleted = selectedInvestment.status === 'completed';
            
            const activeGroupedInvestments = selectedInvestment.groupedInvestmentsList.filter((i: any) => selectedInvestmentIds.includes(i.id));
            const totalAmount = activeGroupedInvestments.reduce((sum: number, i: any) => sum + i.amount, 0);

    const calculateLiveProfit = () => {
      const guaranteedInterestRate = selectedInvestment.interestRate / 100;
      const completed = Number(withdrawFormData.completedMonths) || 12;
      const committed = selectedInvestment.timePeriodMonths || 12;
      
      const totalGuaranteedProfit = totalAmount * guaranteedInterestRate * (completed / 12);
      const marketProfit = totalAmount * (overallTrend / 100) * (completed / 12);
      
      let investorActualProfit = 0;
      let rmasMarketCover = 0;
      
      // If early withdrawal, only get market profit
      if (completed < committed) {
        investorActualProfit = marketProfit;
      } else {
        if (marketProfit > totalGuaranteedProfit) {
          investorActualProfit = marketProfit;
        } else {
          investorActualProfit = totalGuaranteedProfit;
          rmasMarketCover = totalGuaranteedProfit - marketProfit;
        }
      }
      
      return { totalProfit: investorActualProfit, rmasMarketCover };
    };

    const handleConfirmWithdraw = () => {
      const profitDetails = calculateLiveProfit();
      const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
      const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
      const totalCredited = Math.max(0, totalAmount + profitDetails.totalProfit - rmasFee - happyTax);
      
      let rmasSubsidyPays = 0;
      if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
         rmasSubsidyPays = totalAmount * (business.rmasSubsidy / 100) * ((Number(withdrawFormData.completedMonths) || 12) / 12);
      }
      
      const numSelected = activeGroupedInvestments.length;
      if (numSelected === 0) return;

      activeGroupedInvestments.forEach((invToUpdate: any) => {
        // Apportion deductions by amount
        const ratio = invToUpdate.amount / totalAmount;
        dispatch({
          type: 'UPDATE_INVESTMENT',
          payload: {
            ...invToUpdate,
            status: 'completed',
            payoutDetails: {
              rmasCommission: rmasFee * ratio,
              happyIncomeTax: happyTax * ratio,
              totalCredited: totalCredited * ratio,
              payoutDate: new Date().toISOString().split('T')[0],
              rmasMarketCover: profitDetails.rmasMarketCover * ratio,
              rmasSubsidyPays: rmasSubsidyPays * ratio
            }
          }
        });
      });

      setSelectedInvestment(null);
      setWithdrawStep(0);
    };
            const expectedFixedProfit = activeGroupedInvestments.reduce((sum: number, i: any) => sum + (i.amount * i.interestRate / 100), 0);
            const actualDetailProfit = activeGroupedInvestments.reduce((sum: number, i: any) => {
              if (i.payoutDetails) {
                return sum + (i.payoutDetails.totalCredited + (i.payoutDetails.rmasCommission || 0) + (i.payoutDetails.happyIncomeTax || 0) - i.amount);
              }
              return sum;
            }, 0);
            const holdingProfit = isCompleted ? actualDetailProfit : (totalAmount * overallTrend / 100);
            
            const curValue = totalAmount + holdingProfit;
            const isProfit = holdingProfit >= 0;
            
            return (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-kite-text">{business?.name}</h4>
                    <p className="text-xs text-kite-text-light mt-0.5">Investment ID: #{selectedInvestment.id} • {selectedInvestment.status.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-kite-text-light uppercase tracking-wider mb-1">Market Trend (LTP)</p>
                    <span className={"inline-flex items-center space-x-1 px-2 py-1 rounded-sm text-xs font-medium " + (overallTrend >= 0 ? 'bg-kite-green/10 text-kite-green' : 'bg-kite-red/10 text-kite-red')}>
                      {overallTrend >= 0 ? '+' : ''}{overallTrend.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-kite-border/50">
                  <div>
                    <p className="text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Capital Invested</p>
                    <p className="text-base font-medium text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Current Value</p>
                    <p className="text-base font-medium text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(curValue)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Live P&L</p>
                    <p className={"text-base font-medium " + (isProfit ? 'text-kite-green' : 'text-kite-red')} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {isProfit ? '+' : ''}{formatINR(holdingProfit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-kite-text-light uppercase tracking-wider mb-1">Investor</p>
                    <p className="text-sm font-medium text-kite-text">{investor?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-kite-border/50">
                  <div>
                    <p className="text-xs font-medium text-kite-text-light mb-1">Start Date</p>
                    <p className="text-sm font-mono text-kite-text">
                      {activeGroupedInvestments.length > 1 ? 'Multiple Dates' : new Date(selectedInvestment.startDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-kite-text-light mb-1">Expected Maturity</p>
                    <p className="text-sm font-mono text-kite-text">
                      {activeGroupedInvestments.length > 1 ? 'Multiple Dates' : new Date(selectedInvestment.endDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {selectedInvestment.groupedInvestmentsList.length > 1 && withdrawStep === 0 && (
                  <div className="pt-4 mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs font-medium text-kite-text-light mb-3">
                      {selectedInvestment.status === 'active' ? 'SELECT QUANTITIES TO BOOK PROFIT' : 'SELECT QUANTITIES TO VIEW'}
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      <label className="flex items-center space-x-2 text-sm cursor-pointer border-b border-gray-100 pb-2">
                        <input type="checkbox" 
                          checked={selectedInvestmentIds.length === selectedInvestment.groupedInvestmentsList.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvestmentIds(selectedInvestment.groupedInvestmentsList.map((i: any) => i.id));
                            } else {
                              setSelectedInvestmentIds([]);
                            }
                          }}
                          className="rounded text-kite-blue focus:ring-kite-blue cursor-pointer bg-white" />
                        <span className="font-medium text-kite-text flex-1">
                          {selectedInvestment.status === 'active' ? 'Withdraw All Quantities' : 'View All Quantities'}
                        </span>
                      </label>
                      {selectedInvestment.groupedInvestmentsList.map((invUnit: any) => (
                        <label key={invUnit.id} className="flex items-center justify-between space-x-2 text-sm cursor-pointer px-1">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" 
                              checked={selectedInvestmentIds.includes(invUnit.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedInvestmentIds([...selectedInvestmentIds, invUnit.id]);
                                else setSelectedInvestmentIds(selectedInvestmentIds.filter(id => id !== invUnit.id));
                              }}
                              className="rounded text-kite-blue focus:ring-kite-blue cursor-pointer" />
                            <span className="text-kite-text-light truncate max-w-[120px]">#{invUnit.id}</span>
                          </div>
                          <span className="font-medium text-kite-text">{formatINR(invUnit.amount)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedInvestment.status === 'active' && withdrawStep === 0 && (
                  <div className="pt-4 border-t border-kite-border/50">
                    <button onClick={() => {
                        setWithdrawFormData({ ...withdrawFormData, completedMonths: String(selectedInvestment.timePeriodMonths) });
                        setWithdrawStep(1);
                      }} 
                      disabled={selectedInvestmentIds.length === 0}
                      className="w-full md:w-auto px-6 py-2 bg-kite-blue text-white rounded-sm font-medium tracking-wide shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                      PROFIT BOOK
                    </button>
                  </div>
                )}
                
                {selectedInvestment.status === 'active' && withdrawStep === 1 && (
                  <div className="mt-4 border border-kite-border rounded-sm p-4 bg-kite-bg/50">
                    <h4 className="text-kite-blue font-medium text-sm tracking-wide mb-4">SETTLEMENT CALCULATION</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">Completed Months</label>
                        <input type="number" className="w-full border-b border-kite-blue/30 py-1.5 text-sm outline-none font-medium bg-transparent focus:border-kite-blue" value={withdrawFormData.completedMonths} onChange={e => setWithdrawFormData({...withdrawFormData, completedMonths: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">RMAS Comm (₹)</label>
                        <input type="number" className="w-full border-b border-kite-border py-1.5 text-sm outline-none font-medium bg-transparent focus:border-kite-blue" value={withdrawFormData.rmasCommission} onChange={e => setWithdrawFormData({...withdrawFormData, rmasCommission: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">Income Tax (₹)</label>
                        <input type="number" className="w-full border-b border-kite-border py-1.5 text-sm outline-none font-medium bg-transparent focus:border-kite-red text-kite-red" value={withdrawFormData.happyIncomeTax} onChange={e => setWithdrawFormData({...withdrawFormData, happyIncomeTax: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center max-w-[280px] mx-auto mt-6">
                      <SwipeButton 
                        text="SWIPE TO PROCEED" 
                        successText="SETTLING..." 
                        onSuccess={handleConfirmWithdraw} 
                      />
                      <button onClick={() => setWithdrawStep(0)} className="mt-4 text-xs font-medium text-kite-text-light hover:text-kite-text">Cancel</button>
                    </div>
                  </div>
                )}
                
                {selectedInvestment.status === 'completed' && activeGroupedInvestments.some((i: any) => i.payoutDetails) && (
                  <div className="p-4 bg-kite-green/5 border border-kite-green/20 rounded-sm">
                    <h4 className="font-medium text-kite-green flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed Settlement Breakdown</span>
                    </h4>
                    <div className="space-y-2 text-sm text-green-900">
                      <div className="flex justify-between">
                        <span>Gross Payout (Capital + Profit)</span>
                        <span className="font-medium">
                          {formatINR(activeGroupedInvestments.reduce((sum: number, i: any) => sum + (i.payoutDetails?.totalCredited || 0) + (i.payoutDetails?.rmasCommission || 0) + (i.payoutDetails?.happyIncomeTax || 0), 0))}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>RMAS Commission Deducted</span>
                        <span className="text-kite-red">-{formatINR(activeGroupedInvestments.reduce((sum: number, i: any) => sum + (i.payoutDetails?.rmasCommission || 0), 0))}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Income Tax Deducted</span>
                        <span className="text-kite-red">-{formatINR(activeGroupedInvestments.reduce((sum: number, i: any) => sum + (i.payoutDetails?.happyIncomeTax || 0), 0))}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-kite-green/20 mt-2 font-medium">
                        <span>Net Amount Credited</span>
                        <span>{formatINR(activeGroupedInvestments.reduce((sum: number, i: any) => sum + (i.payoutDetails?.totalCredited || 0), 0))}</span>
                      </div>
                      <div className="flex justify-between text-[11px] mt-1 text-kite-text-light">
                        <span>Payout Date</span>
                        <span className="font-mono">
                          {activeGroupedInvestments.length > 1 ? 'Multiple Dates' : new Date(activeGroupedInvestments[0]?.payoutDetails?.payoutDate || selectedInvestment.payoutDetails.payoutDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  )}

  <AnimatePresence>
 {showSuccessAnimation && successData && (
      <motion.div initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-4 right-0 left-0 mx-4 md:left-auto md:right-8 md:mx-0 z-50 bg-white shadow-lg rounded-sm border-l-4 border-kite-blue p-4 max-w-sm flex items-start space-x-3"
      >
        <div className="w-6 h-6 rounded-full bg-kite-blue flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-kite-text">Investment Booked</h3>
          <p className="text-xs text-kite-text-light mt-1 flex flex-col space-y-0.5">
            <span>{successData.investorName}</span>
            <span>{formatINR(successData.amount)} to {successData.businessName}</span>
          </p>
        </div>
      </motion.div>
      )}
      </AnimatePresence>
 </div>
 );
}

