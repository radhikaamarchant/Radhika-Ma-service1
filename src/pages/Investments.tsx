import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, ReceiptIndianRupee, Search, X, CheckCircle, Wallet, BadgeCheck, ChevronDown } from 'lucide-react';
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
 const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
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

 const activeBusinesses = state.businesses.slice().sort((a, b) => getTime(b.id) - getTime(a.id));
 const sortedInvestors = state.investors.slice().sort((a, b) => getTime(b.id) - getTime(a.id));

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
 <div className="flex-1">
 <h2 className="text-xs md:text-base font-medium text-kite-text tracking-tight">Funding & Investments</h2>
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
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-sm font-medium flex items-center space-x-2 transition-colors whitespace-nowrap shadow-sm"
  >
 <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
 <span>New Funding Link</span>
 </button>
 </div>
 </div>

   {showAddForm && (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-100 rounded shadow-sm p-6 md:p-10 animate-fade-in mt-4 md:mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <div className="h-full bg-blue-500 w-full transition-all duration-300"></div>
      </div>
      <div className="text-center mb-8">
        <button type="button" onClick={() => setShowAddForm(false)} className="text-blue-500 mb-4 inline-block hover:bg-blue-50 p-1.5 rounded transition-colors absolute top-6 left-6">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Book new investment</h3>
        <p className="text-sm text-gray-500 mt-2">Fund a business and collect commission</p>
      </div>
      <form onSubmit={handleAddSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="relative group">
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Select Business</label>
 <div className="w-full border-b-2 border-gray-200 p-3 bg-transparent text-lg font-medium focus:border-blue-500 outline-none transition-colors cursor-pointer flex justify-between items-center"
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
 <div className="relative group">
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Select Investor</label>
 <div className="w-full border-b-2 border-gray-200 p-3 bg-transparent text-lg font-medium focus:border-blue-500 outline-none transition-colors cursor-pointer flex justify-between items-center"
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
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Investment Amount (₹) (INR Format)</label>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-kite-text-light">₹</span>
 <input required type="text" className="w-full border-b-2 border-gray-200 pl-8 pr-3 py-3 text-lg font-medium focus:border-blue-500 outline-none transition-colors" value={formData.amount} onChange={handleAmountChange} placeholder="e.g. 5,00,000" />
 </div>
 </div>
 <div className="group">
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Time Period (Months)</label>
 <input required type="number" min="1" className="w-full border-b-2 border-gray-200 p-3 text-lg font-medium focus:border-blue-500 outline-none transition-colors" value={formData.timePeriodMonths} onChange={e => setFormData({...formData, timePeriodMonths: e.target.value})} />
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
 <h4 className="text-sm font-medium mb-3 text-kite-red">Admin Commission Processing</h4>
 <p className="text-xs text-kite-text-light mb-4">Set percentage to collect commission from both parties at the time of funding.</p>
 <div className="grid grid-cols-1 md:grid-cols-2">
 <div className="flex gap-2 md:gap-4">
 <div className="flex-1 group">
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">From Business (%)</label>
 <input type="number" step="0.1" className="w-full border-b-2 border-gray-200 p-3 font-medium focus:border-blue-500 outline-none transition-colors" value={formData.adminCommissionBusinessPct} onChange={e => setFormData({...formData, adminCommissionBusinessPct: e.target.value})} />
 </div>
 <div className="flex-1 flex flex-col justify-end pb-2">
 <span className="text-sm font-medium text-kite-red">{formatINR(calculateCommissions().fromBusiness)}</span>
 </div>
 </div>
 <div className="flex gap-2 md:p-4 border-l border-kite-border pl-4">
 <div className="flex-1 group">
  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">From Investor (%)</label>
 <input type="number" step="0.1" className="w-full border-b-2 border-gray-200 p-3 font-medium focus:border-blue-500 outline-none transition-colors" value={formData.adminCommissionInvestorPct} onChange={e => setFormData({...formData, adminCommissionInvestorPct: e.target.value})} />
 </div>
 <div className="flex-1 flex flex-col justify-end pb-2">
 <span className="text-sm font-medium text-kite-red">{formatINR(calculateCommissions().fromInvestor)}</span>
 </div>
 </div>
 </div>
 <div className="text-right mt-2">
 <p className="text-sm font-medium text-kite-red">Total Admin Profit: {formatINR(calculateCommissions().fromBusiness + calculateCommissions().fromInvestor)}</p>
 </div>
 </div>

 
  <div className="pt-6">
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

 
    <div className="bg-white border border-kite-border rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-kite-bg">
          <tr className="text-xs text-kite-text-light border-b border-kite-border/50">
            <th className="py-2 px-4 font-normal">Instrument</th>
            <th className="py-2 px-4 font-normal">Investor</th>
            <th className="py-2 px-4 font-normal text-right">Capital</th>
            <th className="py-2 px-4 font-normal text-right">Cur. val</th>
            <th className="py-2 px-4 font-normal text-right">P&L</th>
            <th className="py-2 px-4 font-normal text-right">Mkt Trend</th>
            <th className="py-2 px-4 font-normal text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kite-border/50">
          {filteredInvestments.map(inv => {
            const business = state.businesses.find(b => b.id === inv.businessId);
            const investor = state.investors.find(i => i.id === inv.investorId);
            
            const trend = business ? getBaseMarketTrend(business, state.investments) : 0;
            const liveTrend = marketState.trends[inv.businessId] || 0;
            const overallTrend = trend + liveTrend;
            
            const isCompleted = inv.status === 'completed';
            const expectedFixedProfit = (inv.amount * inv.interestRate / 100);
            
            // In a real holding context, we might fluctuate, but here let's just show fixed profit if completed,
            // and dynamic holding profit if active based on trend to simulate equity.
            const holdingProfit = isCompleted ? expectedFixedProfit : (inv.amount * overallTrend / 100);
            const curValue = inv.amount + holdingProfit;
            const pnlPercentage = isCompleted ? inv.interestRate : overallTrend;
            const isProfit = holdingProfit >= 0;
            
            return (
              <tr key={inv.id} className="hover:bg-kite-bg/50 transition-colors cursor-pointer" onClick={() => setSelectedInvestment(inv)}>
                <td className="py-3 px-4">
                  <p className="font-medium text-kite-text">{business?.name}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-xs text-kite-text-light">{investor?.name}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="font-normal text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(inv.amount)}</p>
                </td>
                <td className="py-3 px-4 text-right">
                  <p className="font-medium text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(curValue)}</p>
                </td>
                <td className={"py-3 px-4 text-right font-medium " + (isProfit ? 'text-kite-green' : 'text-kite-red')}>
                  <div className="flex flex-col items-end">
                    <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{isProfit ? '+' : ''}{formatINR(holdingProfit)}</p>
                    <p className="text-[10px] opacity-80">{isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%</p>
                  </div>
                </td>
                <td className={"py-3 px-4 text-right font-medium " + (overallTrend >= 0 ? 'text-kite-green' : 'text-kite-red')}>
                  {overallTrend >= 0 ? '+' : ''}{overallTrend.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={"inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-medium " + (isCompleted ? 'bg-kite-blue/10 text-kite-blue' : 'bg-kite-green/10 text-kite-green')}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            );
          })}
          {filteredInvestments.length === 0 && (
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
            <X className="w-4 h-4 md:w-6 md:h-6" />
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
    const calculateLiveProfit = () => {
      const guaranteedInterestRate = selectedInvestment.interestRate / 100;
      const completed = Number(withdrawFormData.completedMonths) || 12;
      const committed = selectedInvestment.timePeriodMonths || 12;
      
      const totalGuaranteedProfit = selectedInvestment.amount * guaranteedInterestRate * (completed / 12);
      const marketProfit = selectedInvestment.amount * (overallTrend / 100) * (completed / 12);
      
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
      const totalCredited = Math.max(0, selectedInvestment.amount + profitDetails.totalProfit - rmasFee - happyTax);
      
      let rmasSubsidyPays = 0;
      if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
         rmasSubsidyPays = selectedInvestment.amount * (business.rmasSubsidy / 100) * ((Number(withdrawFormData.completedMonths) || 12) / 12);
      }
      
      dispatch({
        type: 'SETTLE_INVESTMENT_PAYOUT',
        payload: {
          investmentId: selectedInvestment.id,
          payoutDetails: {
            rmasCommission: rmasFee,
            happyIncomeTax: happyTax,
            totalCredited: totalCredited,
            payoutDate: new Date().toISOString().split('T')[0],
            rmasMarketCover: profitDetails.rmasMarketCover,
            rmasSubsidyPays: rmasSubsidyPays
          }
        }
      });
      setSelectedInvestment(null);
      setWithdrawStep(0);
    };
            const expectedFixedProfit = (selectedInvestment.amount * selectedInvestment.interestRate / 100);
            const holdingProfit = isCompleted ? expectedFixedProfit : (selectedInvestment.amount * overallTrend / 100);
            
            const curValue = selectedInvestment.amount + holdingProfit;
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
                    <p className="text-base font-medium text-kite-text" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{formatINR(selectedInvestment.amount)}</p>
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
                    <p className="text-sm font-mono text-kite-text">{new Date(selectedInvestment.startDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-kite-text-light mb-1">Expected Maturity</p>
                    <p className="text-sm font-mono text-kite-text">{new Date(selectedInvestment.endDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                
                {selectedInvestment.status === 'active' && withdrawStep === 0 && (
                  <div className="pt-4 border-t border-kite-border/50">
                    <button onClick={() => {
                        setWithdrawFormData({ ...withdrawFormData, completedMonths: String(selectedInvestment.timePeriodMonths) });
                        setWithdrawStep(1);
                      }} 
                      className="w-full md:w-auto px-6 py-2 bg-kite-blue text-white rounded-sm font-medium tracking-wide shadow-sm hover:opacity-90 transition-opacity">
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
                
                {selectedInvestment.status === 'completed' && selectedInvestment.payoutDetails && (
                  <div className="p-4 bg-kite-green/5 border border-kite-green/20 rounded-sm">
                    <h4 className="font-medium text-kite-green flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed Settlement Breakdown</span>
                    </h4>
                    <div className="space-y-2 text-sm text-green-900">
                      <div className="flex justify-between">
                        <span>Total Profit + Capital Credited</span>
                        <span className="font-medium">{formatINR(selectedInvestment.payoutDetails.totalCredited)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>RMAS Commission Deducted</span>
                        <span className="text-kite-red">-{formatINR(selectedInvestment.payoutDetails.rmasCommission)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Happy Muslim Tax Deducted</span>
                        <span className="text-kite-red">-{formatINR(selectedInvestment.payoutDetails.happyIncomeTax)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-kite-green/20 mt-2">
                        <span>Payout Date</span>
                        <span className="font-mono">{new Date(selectedInvestment.payoutDetails.payoutDate).toLocaleDateString('en-IN')}</span>
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

