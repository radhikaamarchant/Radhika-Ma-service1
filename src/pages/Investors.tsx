import React, { useState, useRef } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, Search, Users, Banknote, Building, FileText, Download, X, ArrowLeft, CreditCard, Wallet, CheckCircle, BadgeCheck, Clock } from 'lucide-react';
import { Investor, Investment, Business } from '../types';
import { INDIAN_BANKS } from '../utils/indianBanks';
import { downloadElementAsPDF } from '../utils/pdfGenerator';
import { getVerificationStats } from '../utils/blueTick';
import { getBaseMarketTrend } from '../utils/marketSimulator';
import { useMarketSimulation } from '../utils/MarketSimulationContext';
import { SwipeButton } from '../components/SwipeButton';
import InvestorDetail from '../components/InvestorDetail';

type ViewMode = 'list' | 'add-step-1' | 'add-step-2' | 'withdraw-list' | 'withdraw-calc' | 'withdraw-bank' | 'banking-record' | 'investor-detail';

export default function Investors() {
 const { state, dispatch } = useAppContext();
 const { marketState } = useMarketSimulation();
 const statsMap = getVerificationStats(state.businesses, state.investments);
 const [viewMode, setViewMode] = useState<ViewMode>('list');
 const [searchTerm, setSearchTerm] = useState('');
 // Withdraw State
 const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
 const [selectedInvestments, setSelectedInvestments] = useState<Investment[]>([]);
 const [withdrawFormData, setWithdrawFormData] = useState({
 committedMonths: '12',
 completedMonths: '12',
 rmasCommission: '',
 happyIncomeTax: '',
 });

 const [withdrawQtyMap, setWithdrawQtyMap] = useState<Record<string, number>>({});

 // PDF Modal State
 const [pdfInvestor, setPdfInvestor] = useState<Investor | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifySuccess, setShowVerifySuccess] = useState(false);
 const [pdfProfitSlip, setPdfProfitSlip] = useState<{investment: Investment, investor: Investor, business: Business} | null>(null);

 const [formData, setFormData] = useState({
 investorId: '',
 name: '',
 bankName: INDIAN_BANKS[0],
 accountNumber: '',
 ifscCode: '',
 accountHolderName: '',
 rmasServiceCharge: '',
 });

   
 const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;

 const filteredInvestors = state.investors.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 i.investorId.includes(searchTerm)
 ).map(i => {
 const totalAmountInvested = state.investments
 .filter(inv => inv.investorId === i.id && inv.status !== 'completed')
 .reduce((sum, inv) => sum + inv.amount, 0);
 return { ...i, totalInvested: totalAmountInvested };
 }).sort((a, b) => getTime(b.id) - getTime(a.id));

 const generateInvestorId = () => {
 return Math.floor(100000 + Math.random() * 900000).toString();
 };

 
 const startAddInvestor = () => {
 setFormData({
 ...formData,
 investorId: generateInvestorId(),
 name: '',
 bankName: INDIAN_BANKS[0],
 accountNumber: '',
 ifscCode: '',
 accountHolderName: '',
 rmasServiceCharge: '',
 });
 setViewMode('add-step-1');
 };

 const handleNextStep = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.name.trim()) return;
 setFormData({
 ...formData,
 accountHolderName: formData.name.toUpperCase() // auto fill all caps
 });
 setViewMode('add-step-2');
 };

 const handleVerifiedSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      const newInvestor: Investor = {
        id: crypto.randomUUID(),
        investorId: formData.investorId,
        name: formData.name,
        totalInvested: 0,
        joinDate: new Date().toISOString(),
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName.toUpperCase()
        },
        rmasServiceCharge: Number(formData.rmasServiceCharge.toString().replace(/,/g, '')) || 0
      };

      dispatch({ type: 'ADD_INVESTOR', payload: newInvestor });
      setIsVerifying(false);
      setShowVerifySuccess(true);
      
      setTimeout(() => {
        setShowVerifySuccess(false);
        setViewMode('list');
      }, 2000);
    }, 800);
  };

 const handleWithdrawClick = (investor: Investor) => {
 setSelectedInvestor(investor);
 setWithdrawQtyMap({});
 setViewMode('withdraw-list');
 };

 const handleBankingRecordClick = (investor: Investor) => {
 setSelectedInvestor(investor);
 setViewMode('banking-record');
 };

 const handleCreditInvestorClick = (investments: Investment[]) => {
 setSelectedInvestments(investments);
 setWithdrawFormData({
 committedMonths: investments.length > 0 ? investments[0].timePeriodMonths.toString() : '12',
 completedMonths: investments.length > 0 ? investments[0].timePeriodMonths.toString() : '12',
 rmasCommission: '',
 happyIncomeTax: '',
 });
 setViewMode('withdraw-calc');
 };

 const businessId = selectedInvestments.length > 0 ? selectedInvestments[0].businessId : '';
 const business = state.businesses.find(b => b.id === businessId);
 const isBlueTick = statsMap.get(businessId)?.isBlueTick ?? false;
 const isPreVerified = statsMap.get(businessId)?.isPreVerified ?? false;
 const marketTrend = marketState.trends[businessId] || 0;

 const calculateProfit = () => {
 if (selectedInvestments.length === 0) return { baseProfit: 0, totalProfit: 0, marketProfit: 0, rmasMarketCover: 0, marketTrend: 0, isPremature: false };
 let totalPrincipal = 0;
 let totalGuaranteedProfit = 0;
 const committed = Number(withdrawFormData.committedMonths) || 12;
 const completed = Number(withdrawFormData.completedMonths) || 12;
 selectedInvestments.forEach(inv => {
 totalPrincipal = inv.amount;
 const guaranteedInterestRate = inv.interestRate / 100;
 totalGuaranteedProfit = inv.amount * guaranteedInterestRate * (completed / 12);
 });

 // The live market trend provides an annual percentage.
 // Calculate the absolute profit/loss proportional to the completed months.
 const marketProfit = totalPrincipal * (marketTrend / 100) * (completed / 12);

 let investorActualProfit = 0;
 let rmasMarketCover = 0;

 if (completed < committed) {
 investorActualProfit = marketProfit;
 } else {
 if (marketProfit > totalGuaranteedProfit) {
 investorActualProfit = marketProfit;
 } else {
 investorActualProfit = totalGuaranteedProfit;
 rmasMarketCover = totalGuaranteedProfit - marketProfit; }
 }

 return {
 baseProfit: totalGuaranteedProfit,
 totalProfit: investorActualProfit,
 marketProfit,
 rmasMarketCover,
 marketTrend,
 isPremature: completed < committed
 };
 };

 const calculateFinalPayout = () => {
 if (selectedInvestments.length === 0) return 0;
 const { totalProfit } = calculateProfit();
 const totalPrincipal = selectedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
 const grossAmount = totalPrincipal + totalProfit;
 const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
 const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
 return Math.max(0, grossAmount - rmasFee - happyTax);
 };

 const calculateBusinessBurden = () => {
 if (selectedInvestments.length === 0) return { businessPays: 0, rmasSubsidyPays: 0, rmasMarketCover: 0, totalRmasContribution: 0 };
 const business = state.businesses.find(b => b.id === selectedInvestments[0].businessId);
 const { rmasMarketCover } = calculateProfit();
 let rmasSubsidyPays = 0;
 const completed = Number(withdrawFormData.completedMonths) || 12;

 if (business && business.rmasSubsidy && business.rmasSubsidy > 0) {
 selectedInvestments.forEach(inv => {
 rmasSubsidyPays = inv.amount * (business.rmasSubsidy! / 100) * (completed / 12);
 });
 }

 const finalPayout = calculateFinalPayout();
 let businessPays = finalPayout - rmasMarketCover - rmasSubsidyPays;
 if (businessPays < 0) businessPays = 0;

 return {
 businessPays,
 rmasSubsidyPays,
 rmasMarketCover,
 totalRmasContribution: rmasMarketCover + rmasSubsidyPays
 };
 };

 const goToBanking = (e?: React.FormEvent) => {
 if (e && e.preventDefault) e.preventDefault();
 setViewMode('withdraw-bank');
 };

 const handlePay = () => {
 if (selectedInvestments.length === 0 || !selectedInvestor) return;
 const business = state.businesses.find(b => b.id === selectedInvestments[0].businessId);
 if (!business) return;

 const rmasFee = Number(withdrawFormData.rmasCommission) || 0;
 const happyTax = Number(withdrawFormData.happyIncomeTax) || 0;
 const finalPayout = calculateFinalPayout();
 const totalAmount = selectedInvestments.reduce((s, i) => s + i.amount, 0);
  const burden = calculateBusinessBurden();

  selectedInvestments.forEach(inv => {
 const ratio = totalAmount > 0 ? (inv.amount / totalAmount) : (1 / selectedInvestments.length);
 const updatedInvestment: Investment = {
 ...inv,
 status: 'completed',
 payoutDetails: {
 rmasCommission: rmasFee * ratio,
 happyIncomeTax: happyTax * ratio,
 totalCredited: finalPayout * ratio,
  payoutDate: new Date().toISOString(),
  rmasMarketCover: burden.rmasMarketCover * ratio,
  rmasSubsidyPays: burden.rmasSubsidyPays * ratio
  }
 };
 dispatch({ type: 'UPDATE_INVESTMENT', payload: updatedInvestment });
 });
 const mergedInv: Investment = {
 ...selectedInvestments[0],
 amount: totalAmount,
 payoutDetails: {
 rmasCommission: rmasFee,
 happyIncomeTax: happyTax,
 totalCredited: finalPayout,
  payoutDate: new Date().toISOString(),
  rmasMarketCover: burden.rmasMarketCover,
  rmasSubsidyPays: burden.rmasSubsidyPays
  }
 };
 // Generate Profit Slip
 setPdfProfitSlip({ investment: mergedInv, investor: selectedInvestor, business });
 setViewMode('list');
 setSelectedInvestor(null);
 setSelectedInvestments([]);
 };

 const handlePrintProfitSlip = () => {
 downloadElementAsPDF('profit-slip-content', `Profit_Slip_${pdfProfitSlip?.investor.name || 'Investor'}`);
 };

 const handlePrintInvestorPDF = () => {
 downloadElementAsPDF('investor-pdf-content', `Terms_${pdfInvestor?.name || 'Investor'}`);
 };

 return (
 <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6 print:m-0 print:p-0">
 {/* --- Hide this whole container during print --- */}
 <div className="print:hidden space-y-3 sm:space-y-6">
 {viewMode === 'investor-detail' && selectedInvestor && (<InvestorDetail investorId={selectedInvestor.id} onBack={() => { setViewMode('list'); setSelectedInvestor(null); }} />)}

        {viewMode === 'list' && (
 <>
 <div className="flex justify-between items-end">
 <div>
 <h2 className="text-xs md:text-base font-medium text-kite-text tracking-tight">Investors</h2>
 <p className="text-sm text-kite-text-light mt-1">Manage network of funders and investors.</p>
 </div>
 <button onClick={startAddInvestor}
 className="bg-kite-blue hover:bg-kite-blue text-white px-4 py-2 rounded-sm font-medium flex items-center space-x-2 transition-colors"
 >
 <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
 <span>New Investors</span>
 </button>
 </div>

 <div className="w-full bg-white border border-kite-border rounded-sm overflow-hidden">
 <div className="p-2 sm:p-4 border-b border-kite-border flex items-center bg-kite-bg">
 <Search  className="w-3.5 h-3.5 md:w-4 md:h-4 text-kite-text-light mr-2" />
 <input type="text" placeholder="Search investors by name or ID..." className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="overflow-hidden">
 {/* Desktop Table View */}
 <div className="hidden md:block overflow-x-auto w-full max-w-full">
 <table className="w-full text-left text-sm min-w-[800px]">
 <thead>
 <tr className="border-b border-kite-border bg-white">
 <th className="p-2 md:p-4 font-medium text-kite-text">ID Number</th>
 <th className="p-2 md:p-4 font-medium text-kite-text">Name</th>
 <th className="p-2 md:p-4 font-medium text-kite-text text-right">Total Invested</th>
 <th className="p-2 md:p-4 font-medium text-kite-text text-center">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredInvestors.map(investor => {
 const hasActiveInvestments = state.investments.some(inv => inv.investorId === investor.id && inv.status === 'active');
 return (
 <tr key={`desk_${investor.id}`} className="border-b border-kite-border hover:bg-kite-bg">
 <td className="p-2 md:p-4 font-mono text-kite-text-light font-medium">#{investor.investorId}</td>
 <td className="p-2 md:p-4 font-medium text-kite-text">{investor.name}</td>
 <td className="p-2 md:p-4 font-medium text-kite-text text-right">{formatINR(investor.totalInvested)}</td>
 <td className="p-2 md:p-4 text-center space-x-2">
 <button onClick={() => { setSelectedInvestor(investor); setViewMode('investor-detail'); }}
 className="text-black bg-white border border-kite-border hover:bg-kite-bg font-medium text-xs px-3 py-1.5 rounded-sm transition-colors"
 >
 My profile
 </button>
 {hasActiveInvestments && (
 <button onClick={() => handleWithdrawClick(investor)}
 className="bg-kite-blue text-white hover:bg-kite-blue font-medium text-xs px-3 py-1.5 rounded-sm"
 >
 Withdraw
 </button>
 )}
 </td>
 </tr>
 );
 })}
 {filteredInvestors.length === 0 && (
 <tr>
 <td colSpan={5} className="p-4 text-center text-kite-text-light font-medium">No investors found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards View */}
 <div className="block md:hidden divide-y divide-gray-100">
 {filteredInvestors.map(investor => {
 const hasActiveInvestments = state.investments.some(inv => inv.investorId === investor.id && inv.status === 'active');
 return (
 <div key={`mob_${investor.id}`} className="p-4 bg-white hover:bg-kite-bg">
 <div className="flex justify-between items-start mb-2">
 <span className="font-medium text-kite-text text-xs md:text-base">{investor.name}</span>
 <span className="font-mono text-xs text-kite-text-light bg-kite-bg px-2 py-1 rounded">#{investor.investorId}</span>
 </div>
 <div className="grid grid-cols-1 gap-3 mb-4 bg-kite-bg p-3 rounded-sm">
 <div className="flex justify-between items-center">
 <p className="text-xs text-kite-text-light">Total Invested</p>
 <p className="font-medium text-sm text-kite-text">{formatINR(investor.totalInvested)}</p>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">
 <button onClick={() => { setSelectedInvestor(investor); setViewMode('investor-detail'); }}
 className="flex-1 text-black bg-white font-medium text-xs px-3 py-2 border border-kite-border hover:bg-kite-bg rounded-sm text-center whitespace-nowrap min-w-[120px] transition-colors"
 >
 My profile
 </button>
 {hasActiveInvestments && (
 <button onClick={() => handleWithdrawClick(investor)}
 className="flex-1 bg-kite-blue text-white hover:bg-kite-blue font-medium text-xs px-3 py-2 rounded-sm text-center whitespace-nowrap min-w-[80px]"
 >
 Withdraw
 </button>
 )}
 </div>
 </div>
 );
 })}
 {filteredInvestors.length === 0 && (
 <div className="p-4 text-center text-kite-text-light font-medium">No investors found.</div>
 )}
 </div>
 </div>
 </div>
 </>
 )}

 {viewMode === 'add-step-1' && (
        <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 rounded shadow-sm p-6 md:p-10 animate-fade-in mt-4 md:mt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div className="h-full bg-blue-500 w-1/2 transition-all duration-300"></div>
          </div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Open a new account</h3>
            <p className="text-sm text-gray-500 mt-2">Step 1 • Basic Profile</p>
          </div>
          <form onSubmit={handleNextStep} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Investor ID Number</label>
              <input type="text" readOnly className="w-full border-b-2 border-gray-200 bg-gray-50/50 text-gray-400 font-mono p-3 outline-none cursor-not-allowed transition-colors" value={formData.investorId} />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Full Name</label>
              <input required type="text" autoFocus
                className="w-full border-b-2 border-gray-200 p-3 text-lg font-medium focus:border-blue-500 outline-none transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Radhika Merchant" />
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded text-sm md:text-base font-semibold tracking-wide transition-all shadow-md hover:shadow-lg">Continue to Bank Details</button>
              <button type="button" onClick={() => setViewMode('list')} className="w-full mt-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Cancel Application</button>
            </div>
          </form>
        </div>
      )}

 {viewMode === 'add-step-2' && (
        <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 rounded shadow-sm p-6 md:p-10 animate-fade-in mt-4 md:mt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div className="h-full bg-blue-500 w-full transition-all duration-300"></div>
          </div>
          <div className="mb-8">
            <button type="button" onClick={() => setViewMode('add-step-1')} className="text-blue-500 mb-4 inline-block hover:bg-blue-50 p-1.5 rounded transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Link Bank Account</h3>
            <p className="text-sm text-gray-500 mt-2">Step 2 • Banking Process & Fees</p>
          </div>
          <form onSubmit={handleVerifiedSave} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Bank Name</label>
              <select className="w-full border-b-2 border-gray-200 p-3 bg-white font-medium focus:border-blue-500 outline-none transition-colors"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              >
                {INDIAN_BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Account Number</label>
              <input required type="text" className="w-full border-b-2 border-gray-200 p-3 font-mono text-lg focus:border-blue-500 outline-none transition-colors tracking-widest" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} placeholder="30291039482" />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Bank IFSC Code</label>
              <input required type="text" className="w-full border-b-2 border-gray-200 p-3 font-mono text-lg uppercase focus:border-blue-500 outline-none transition-colors tracking-widest" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} placeholder="SBIN0001234" />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-500 transition-colors">Account Holder Name</label>
              <input required type="text" className="w-full border-b-2 border-gray-200 p-3 font-medium text-gray-800 uppercase focus:border-blue-500 outline-none transition-colors" value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value.toUpperCase()})} />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-green-500 transition-colors">Radhika Ma Service Charge (₹)</label>
              <input required type="text" className="w-full border-b-2 border-gray-200 bg-green-50/50 p-3 font-bold text-xl text-green-700 focus:border-green-500 outline-none transition-colors" value={formData.rmasServiceCharge} 
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  if (!raw) {
                    setFormData({...formData, rmasServiceCharge: ''});
                  } else {
                    const formatted = new Intl.NumberFormat('en-IN').format(parseInt(raw));
                    setFormData({...formData, rmasServiceCharge: formatted});
                  }
                }} placeholder="0" />
            </div>

            <div className="pt-6">
              <button type="submit" disabled={isVerifying} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white flex items-center justify-center space-x-2 py-4 rounded text-sm md:text-base font-semibold tracking-wide transition-all shadow-md hover:shadow-lg h-[56px] relative">
                <span className={`transition-opacity duration-300 ${isVerifying ? 'opacity-0' : 'opacity-100'}`}>Verify & Create Account</span>
                {isVerifying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
 {viewMode === 'withdraw-list' && selectedInvestor && (
 <div className="w-full bg-white border border-kite-border rounded-sm p-4 max-w-6xl mx-auto">
 <div className="flex items-center mb-3 sm:mb-3 md:mb-6">
 <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-full hover:bg-kite-bg text-kite-text-light transition-colors">
 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 <div>
 <h3 className="text-xs md:text-base font-medium text-kite-text flex items-center space-x-2">
 <span>Withdrawal Mode: {selectedInvestor.name}</span>
 </h3>
 <p className="text-xs text-kite-text-light">Select an investment to withdraw and credit the investor.</p>
 </div>
 </div>

 <div className="space-y-4">
 {Object.entries(
 state.investments.filter(i => i.investorId === selectedInvestor.id).reduce((acc, inv) => {
 if (!acc[inv.businessId]) acc[inv.businessId] = [];
 acc[inv.businessId].push(inv);
 return acc;
 }, {} as Record<string, Investment[]>)
 ).map(([bizId, groupInvs]: [string, Investment[]]) => {
 const business = state.businesses.find(b => b.id === bizId);
 const activeInvs = groupInvs.filter(i => i.status === 'active');
 const completedInvs = groupInvs.filter(i => i.status === 'completed');
 const currentQty = withdrawQtyMap[bizId] ?? (activeInvs.length > 0 ? 1 : 0);
 const totalAmount = groupInvs.reduce((sum, inv) => sum + inv.amount, 0);

 return (
 <div key={bizId} className="border-b border-kite-border last:border-0 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between bg-white hover:bg-kite-bg transition-colors">
 <div className="mb-3 md:mb-0 flex justify-between items-center w-full md:w-auto">
 <div>
 <h4 className="font-medium text-sm md:text-base text-kite-text">{business?.name || 'Unknown Business'}</h4>
 <div className="hidden md:block">
 <p className="text-sm text-kite-text-light mt-1">Owner: {business?.ownerName} | Bus. ID: {business?.businessId}</p>
 <p className="text-xs font-mono text-kite-text-light mt-0.5">{activeInvs.length} Active | {completedInvs.length} Withdrawn</p>
 </div>
 </div>
 </div>
 <div className="flex flex-col md:items-end justify-center w-full md:w-auto mt-2 md:mt-0">
 <div className="hidden md:block text-right mb-2">
 <p className="font-medium text-base text-kite-text">{formatINR(totalAmount)}</p>
 <p className="text-sm font-medium text-kite-green">{activeInvs[0]?.interestRate || completedInvs[0]?.interestRate || 0}% Interest</p>
 </div>
 {activeInvs.length > 0 ? (
 <div className="flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto pt-2 md:pt-0 border-t border-kite-border md:border-0">
 <div className="flex items-center space-x-2">
 <label className="text-[10px] sm:text-xs font-medium text-kite-text-light uppercase tracking-wider">Qty</label>
 <select value={currentQty}
 onChange={e => setWithdrawQtyMap({...withdrawQtyMap, [bizId]: Number(e.target.value)})}
 className="border border-kite-border rounded-sm p-1 text-xs sm:text-sm font-medium bg-kite-bg focus:ring-1 focus:ring-blue-500 outline-none"
 >
 {Array.from({length: activeInvs.length}, (_, i) => i + 1).map(n => (
 <option key={n} value={n}>{n}</option>
 ))}
 </select>
 </div>
 <button onClick={() => handleCreditInvestorClick(activeInvs.slice(0, currentQty))}
 className="bg-kite-blue hover:bg-kite-blue text-white font-medium px-4 py-2 rounded-sm text-xs sm:text-sm uppercase tracking-wide transition-colors"
 >
 Profit Book
 </button>
 </div>
 ) : (
 <div className="inline-flex items-center text-kite-text-light font-medium px-2 py-1 text-xs uppercase tracking-wider justify-end w-full md:w-auto pt-2 md:pt-0 border-t border-kite-border md:border-0">
 <CheckCircle className="w-4 h-4 mr-1" /> Booked
 </div>
 )}
 </div>
 </div>
 );
 })}
 {state.investments.filter(i => i.investorId === selectedInvestor.id).length === 0 && (
 <div className="text-center py-8 text-kite-text-light">No investments found for this investor.</div>
 )}
 </div>
 </div>
 )}

 {viewMode === 'withdraw-calc' && selectedInvestments.length > 0 && selectedInvestor && (
 <div className="w-full max-w-lg mx-auto bg-white border border-kite-border rounded-sm p-4">
 <div className="border-b border-kite-border pb-3 mb-4">
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-kite-blue font-medium text-sm md:text-base tracking-wide flex items-center gap-1">
 <CreditCard className="w-4 h-4" /> PROFIT BOOK
 </h3>
 <p className="text-kite-text-light text-xs mt-1">{selectedInvestor.name} • {state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.name} • {selectedInvestments.length} Qty</p>
 </div>
 <div className="text-right">
 <span className="text-[10px] text-kite-text-light block uppercase tracking-wider">Inv Amt</span>
 <span className="font-semibold text-sm text-kite-text">{formatINR(selectedInvestments.reduce((s, i) => s + i.amount, 0))}</span>
 </div>
 </div>
 </div>

 <form onSubmit={e => { e.preventDefault(); goToBanking(); }} className="space-y-4">
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">Committed Term</label>
 <input type="number" readOnly className="w-full border-b border-kite-border py-1.5 text-sm outline-none text-kite-text-light bg-transparent" value={withdrawFormData.committedMonths} />
 </div>
 <div>
 <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">Completed Term</label>
 <input type="number" required className="w-full border-b border-kite-blue/30 py-1.5 text-sm outline-none font-medium bg-transparent focus:border-blue-600" value={withdrawFormData.completedMonths} onChange={e => setWithdrawFormData({...withdrawFormData, completedMonths: e.target.value})} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 pb-2">
 <div>
 <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">RMAS Comm (₹)</label>
 <input type="number" required className="w-full border-b border-kite-border py-1.5 text-sm outline-none font-medium bg-transparent focus:border-kite-blue/30 text-kite-text" value={withdrawFormData.rmasCommission} onChange={e => setWithdrawFormData({...withdrawFormData, rmasCommission: e.target.value})} placeholder="e.g. 5000" />
 </div>
 <div>
 <label className="text-[10px] text-kite-text-light uppercase tracking-widest block mb-1">Income Tax (₹)</label>
 <input type="number" required className="w-full border-b border-kite-border py-1.5 text-sm outline-none font-medium bg-transparent focus:border-red-500 text-kite-red" value={withdrawFormData.happyIncomeTax} onChange={e => setWithdrawFormData({...withdrawFormData, happyIncomeTax: e.target.value})} placeholder="e.g. 2000" />
 </div>
 </div>

 <div className="bg-kite-bg rounded-sm p-3 text-xs border border-kite-border flex flex-col gap-1.5">
 <div className="flex justify-between items-center text-kite-text-light">
 <span>P&L Current Trend:</span>
 <span className={calculateProfit().marketTrend >= 0 ? 'text-kite-green font-medium' : 'text-kite-red font-medium'}>
 {calculateProfit().marketTrend > 0 ? '+' : ''}{calculateProfit().marketTrend.toFixed(2)}%
 </span>
 </div>
 <div className="flex justify-between items-center text-kite-text-light">
 <span>Net Yield:</span>
 <span className={calculateProfit().totalProfit < 0 ? 'text-kite-red font-medium' : 'text-kite-green font-medium'}>
 {calculateProfit().totalProfit < 0 ? '-' : '+'}{formatINR(Math.abs(calculateProfit().totalProfit))}
 </span>
 </div>
 </div>

 <div className="flex justify-between items-center pt-3 border-t border-kite-border">
 <div className="text-kite-text-light text-[10px] uppercase tracking-wider">Gross Payable</div>
 <div className="font-semibold text-kite-text flex items-center gap-2">Final Amt <span className="text-kite-blue text-lg">{formatINR(calculateFinalPayout())}</span></div>
 </div>

 <div className="mt-4 flex flex-col items-center mx-auto w-full max-w-[280px]">
 <SwipeButton 
 text="SWIPE TO PROCEED" 
 successText="SETTING UP..." 
 colorClass="bg-kite-blue" 
 bgClass="bg-kite-bg" 
 onSuccess={goToBanking} 
 className="w-full"
 />
 </div>
 </form>
 </div>
 )}

 {viewMode === 'withdraw-bank' && selectedInvestments.length > 0 && selectedInvestor && (
 <div className="w-full max-w-lg mx-auto bg-white border border-kite-border rounded-sm p-4">
 <div className="text-center mb-6">
 <h3 className="text-kite-blue font-medium text-sm md:text-base tracking-wide flex items-center justify-center gap-2">
 <CreditCard className="w-4 h-4" /> SETTLEMENT
 </h3>
 <p className="text-kite-text-light text-xs mt-1">Confirm final banking settlement details.</p>
 </div>

 <div className="space-y-4">
 {/* Debit Side (Business) */}
 <div className="flex items-center justify-between border-b border-kite-border pb-3">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-sm bg-kite-red/20 flex items-center justify-center font-medium text-kite-red text-[10px]">DR</div>
 <div>
 <p className="text-xs font-semibold text-kite-text">{state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.bankName || 'No Bank Details'}</p>
 <p className="text-[10px] text-kite-text-light">A/C: *{String(state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.accountNumber || '').slice(-4)}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs text-kite-red font-medium">-{formatINR(calculateFinalPayout())}</p>
 </div>
 </div>

 {/* Credit Side (Investor) */}
 <div className="flex items-center justify-between border-b border-kite-border pb-3 pt-1">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-sm bg-kite-green/20 flex items-center justify-center font-medium text-kite-green text-[10px]">CR</div>
 <div>
 <p className="text-xs font-semibold text-kite-text">{selectedInvestor.bankDetails.bankName || 'No Bank Details'}</p>
 <p className="text-[10px] text-kite-text-light">A/C: *{String(selectedInvestor.bankDetails.accountNumber || '').slice(-4)}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs text-kite-green font-medium">+{formatINR(calculateFinalPayout())}</p>
 </div>
 </div>
 </div>

 <div className="mt-8 flex flex-col items-center justify-center space-y-4">
 <div className="w-full max-w-[280px]">
 <SwipeButton 
 text="SWIPE TO PAY" 
 successText="SETTLING..." 
 colorClass="bg-kite-blue"
 bgClass="bg-kite-blue/10"
 onSuccess={handlePay} 
 className="w-full"
 />
 </div>
 <button onClick={() => setViewMode('withdraw-calc')} className="px-6 py-2 rounded-sm font-medium text-kite-text-light hover:text-kite-text-light transition-colors text-xs">Cancel / Modify</button>
 </div>
 </div>
 )}

 {viewMode === 'banking-record' && selectedInvestor && (
 <div className="w-full bg-white border border-kite-border rounded-sm p-4 max-w-5xl mx-auto">
 <div className="flex items-center mb-3 sm:mb-3 md:mb-6">
 <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-full hover:bg-kite-bg text-kite-text-light transition-colors">
 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 <div>
 <h3 className="text-xs md:text-base font-medium text-kite-text flex items-center space-x-2">
 <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-kite-text-light" />
 <span>Banking & Tax Records: {selectedInvestor.name}</span>
 </h3>
 <p className="text-xs text-kite-text-light">View all completed investments, paid profits, and generated slips for this investor.</p>
 </div>
 </div>

 <div className="space-y-4">
 {state.investments.filter(i => i.investorId === selectedInvestor.id && i.status === 'completed').sort((a,b) => getTime(b.id) - getTime(a.id)).map((inv) => {
 const business = state.businesses.find(b => b.id === inv.businessId);
 const payout = inv.payoutDetails;
 return (
 <div key={inv.id} className="border border-kite-border rounded-sm p-3 sm:p-4 md:p-3 md:p-5 flex flex-col md:flex-row md:items-center justify-between bg-white hover:shadow-md transition-shadow">
 <div className="mb-4 md:mb-0">
 <div className="flex items-center space-x-2">
 <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-kite-green" />
 <h4 className="font-medium text-xs md:text-base text-kite-text">{business?.name || 'Unknown Business'}</h4>
 </div>
 <p className="text-sm text-kite-text-light mt-1">Paid On: {payout?.payoutDate ? new Date(payout.payoutDate).toLocaleDateString('en-IN') : 'N/A'}</p>
 <p className="text-xs font-mono text-kite-text-light mt-0.5">Inv. ID: #{inv.id}</p>
 </div>
 <div className="grid grid-cols-3 gap-2 w-full md:w-auto mt-3 md:mt-0 md:flex md:items-center md:space-x-8">
 <div className="text-left md:text-right">
 <p className="text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-widest">Invested</p>
 <p className="font-medium text-sm md:text-base text-kite-text">{formatINR(inv.amount)}</p>
 </div>
 <div className="text-center md:text-right">
 <p className="text-[10px] md:text-xs font-medium text-kite-green uppercase tracking-widest">Returned</p>
 <p className="font-medium text-sm md:text-base text-kite-green">{formatINR(payout?.totalCredited || 0)}</p>
 </div>
 <div className="text-right">
 <p className="text-[10px] md:text-xs font-medium text-kite-red uppercase tracking-widest">Tax Paid</p>
 <p className="font-medium text-sm md:text-base text-kite-red">{formatINR(payout?.happyIncomeTax || 0)}</p>
 </div>
 </div>
 <div className="mt-4 md:mt-0 md:border-l md:border-kite-border md:pl-8 w-full md:w-auto">
 <button onClick={() => setPdfProfitSlip({ investment: inv, investor: selectedInvestor, business: business! })}
 className="bg-kite-blue/10 hover:bg-kite-blue/20 text-kite-blue font-medium px-4 py-2 rounded-sm text-xs md:text-sm transition-colors flex items-center justify-center space-x-2 w-full"
 >
 <FileText className="w-3 md:w-4 h-3 md:h-4" />
 <span>View Slip</span>
 </button>
 </div>
 </div>
 );
 })}
 {state.investments.filter(i => i.investorId === selectedInvestor.id && i.status === 'completed').length === 0 && (
 <div className="text-center py-12 text-kite-text-light bg-kite-bg rounded-sm border border-kite-border border-dashed">
 <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 text-kite-text-light" />
 <p className="font-medium text-kite-text">No completed banking records found.</p>
 <p className="text-sm mt-1">When an investment is withdrawn, the profit slip will appear here.</p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {/* --- Profit Slip Modal --- */}
 {pdfProfitSlip && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4 print:hidden">
 <div className="bg-white rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
 <div className="sticky top-0 bg-white border-b border-kite-border p-4 flex justify-between items-center z-10">
 <h3 className="font-medium text-xs md:text-base text-kite-text flex items-center space-x-2">
 <CheckCircle className="text-kite-green" />
 <span>Withdrawal Successful & Profit Slip Generated</span>
 </h3>
 <div className="flex items-center space-x-3">
 <button onClick={handlePrintProfitSlip}
 className="bg-kite-blue hover:bg-kite-blue text-white px-4 py-2 flex items-center space-x-2 rounded-sm font-medium transition"
 >
 <Download className="w-3 md:w-4 h-3 md:h-4" />
 <span>Download / Print Slip</span>
 </button>
 <button onClick={() => setPdfProfitSlip(null)}
 className="p-2 hover:bg-kite-bg rounded-full text-kite-text-light"
 >
 <X className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 </div>
 <div className="bg-white rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto">
 <div id="profit-slip-content" className="bg-white border border-kite-border mx-auto max-w-[800px] p-3 sm:p-3 md:p-6 md:p-8 text-kite-text border-l-4 md:border-l-[16px] border-l-black relative overflow-hidden">
 <ProfitSlipContent investment={pdfProfitSlip.investment} investor={pdfProfitSlip.investor} business={pdfProfitSlip.business}
 isBlueTick={statsMap.get(pdfProfitSlip.business.id)?.isBlueTick}
 isPreVerified={statsMap.get(pdfProfitSlip.business.id)?.isPreVerified}
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* --- PROFIT SLIP PRINT VIEW --- */}
 {pdfProfitSlip && (
 <div className="hidden print:block font-sans text-kite-text">
 <ProfitSlipContent investment={pdfProfitSlip.investment} investor={pdfProfitSlip.investor} business={pdfProfitSlip.business}
 isBlueTick={statsMap.get(pdfProfitSlip.business.id)?.isBlueTick}
 isPreVerified={statsMap.get(pdfProfitSlip.business.id)?.isPreVerified}
 />
 </div>
 )}

 {/* --- PDF Modal Preview (Only visible when pdfInvestor is set, hidden during print) --- */}
 {pdfInvestor && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 print:hidden">
 <div className="bg-white rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
 <div className="sticky top-0 bg-white border-b border-kite-border p-4 flex justify-between items-center z-10">
 <h3 className="font-medium text-xs md:text-base text-kite-text">Preview PDF Document</h3>
 <div className="flex items-center space-x-3">
 <button onClick={handlePrintInvestorPDF}
 className="bg-kite-blue hover:bg-kite-blue text-white px-4 py-2 flex items-center space-x-2 rounded-sm font-medium transition"
 >
 <Download className="w-3 md:w-4 h-3 md:h-4" />
 <span>Download / Print</span>
 </button>
 <button onClick={() => setPdfInvestor(null)}
 className="p-2 hover:bg-kite-bg rounded-full text-kite-text-light"
 >
 <X className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 </div>
 {/* Provide a visual boundary for the user before printing */}
 <div className="bg-white rounded-sm md:rounded w-full max-w-6xl max-h-[90vh] overflow-y-auto">
 <div id="investor-pdf-content" className="bg-white border border-kite-border mx-auto max-w-3xl p-4 md:p-8 aspect-auto text-kite-text">
 {/* We just show a preview here, the actual printable content is below */}
 <PdfContent investor={pdfInvestor} />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* --- ACTUAL PRINTABLE CONTENT --- */}
 {/* This is completely hidden from the screen, and only formatted nicely for print. */}
 {pdfInvestor && (
 <div className="hidden print:block font-sans text-kite-text p-0 m-0">
 <PdfContent investor={pdfInvestor} />
 </div>
 )}

 

 </div>
 );
}

// Sub-component for the PDF Content to ensure it's rendered identically in Preview and Print
function PdfContent({ investor }: { investor: Investor }) {
 return (
 <div className="space-y-4 sm:space-y-8 leading-relaxed">
 <div className="text-center space-y-1 sm:space-y-2 border-b-2 border-black pb-3 sm:pb-3 sm:pb-6 mb-4 sm:mb-4 md:mb-8">
 <h1 className="text-base md:text-xl font-medium tracking-widest text-kite-text">RADHIKA MA SERVICE</h1>
 <h2 className="text-xs md:text-base font-medium text-kite-text mt-2">INVESTMENT SERVICE GUIDELINES RULES</h2>
 </div>

 <div className="grid grid-cols-2 gap-2 md:gap-4">
 <div>
 <p className="text-sm font-medium text-kite-text-light uppercase tracking-wide">Investor Details</p>
 <p className="font-medium text-xs md:text-base mt-1 text-kite-text">{investor.name}</p>
 <p className="font-mono text-sm text-kite-text-light mt-0.5">ID: #{investor.investorId}</p>
 <p className="text-sm text-kite-text-light mt-0.5">Joined: {new Date(investor.joinDate).toLocaleDateString('en-IN')}</p>
 </div>
 {investor.bankDetails && (
 <div>
 <p className="text-sm font-medium text-kite-text-light uppercase tracking-wide">Banking Profile</p>
 <p className="font-medium text-kite-text mt-1">{investor.bankDetails.bankName}</p>
 <p className="font-mono text-sm text-kite-text-light mt-0.5">A/C: {investor.bankDetails.accountNumber}</p>
 <p className="font-mono text-sm text-kite-text-light mt-0.5">IFSC: {investor.bankDetails.ifscCode}</p>
 <p className="text-xs font-medium text-kite-text-light mt-1">ACCOUNT HOLDER: {investor.bankDetails.accountHolderName}</p>
 </div>
 )}
 </div>

 <div className="space-y-2 sm:space-y-5 text-justify text-xs sm:text-xs sm:text-base">
 <p>
 <strong>RADHIKA MARCHANT ACOOUNT SERVICE</strong> માં જોડાયા બદલ તમારું સ્વાગત છે તમે અમારે ત્યાં બસ્સીનેસ કરતા વ્યક્તિ ને ઇન્વેસ્ટ કરી ને તેમનો બસ્સીનેસ આગળ લાવવા માં મદદ કરી તે બદલ હું રાધિક મર્ચન્ટ અંબાણી તમને અભિનંદન પાઠવું છું.
 </p>

 <p>
 અમારે ત્યાં તમે જે કંપની માં ઇન્વેસ્ટ કરવા માંગો છો તે તમામ કંપની અમારે ત્યાં <strong>HAPPY MUSLIM INCOME TAX</strong> દ્વારા અને <strong>ABDULJI BHAI PATHAN</strong> દ્વારા દલાલી આપી ત્યારબાદ નોંધ લઈ ને અને <strong>TAX</strong> રજિસ્ટર માન્ય ગણી ને અમારા <strong>RADHIKA MARCHANT ACCOUNT SERVICE</strong> માં <strong>VERFIED</strong> કરવાની પરવાનગી અમે આપીએ છીએ.
 </p>

 <p>
 <strong>RADHIKA MA SERVICE</strong> દરમિયાન અમે માત્ર અમારે ત્યાં રજિસ્ટર થયેલ બસ્સીનેસ માં જ ઇન્વેસ્ટ કરવાની પરવાનગી આપીએ છીએ જોવા તમે પર્સનલી રીતે વાત ચીત કરીને અથવા અન્ય અમારી કંપની શિવાય ના એજન્ટ અથવા વ્યક્તિ ની સલાહ લઈ ને જો ઇન્વેસ્ટ કરો છો ત્યાર બાદ કોઈ છેતરપિંડી થાઈ તો તે બદલ <strong>RMAS</strong> તેમાં કોઈ રીતે જવાબદાર ગણાતી નથી.
 </p>

 <p>
 તમારા ઇન્વેસ્ટમેન્ટ દરમિયાન જે કઈ લેણદેણ થાઈ તે તમારા બેંક અકાઉંટ દ્વારા જ કરવામાં આવશે અન્યતા કોઈ રોકડ વ્યવહાર કરવામાં આવશે નહીં જેથી તમામ અમોઉન્ટ ઉપર ફરજિયાત હુકમ કરીને <strong>HAPPY MUSLIM TAX</strong> લાગુ પડે છે જેથી સરકાર દ્વારા ગાઇડલાઇન્સ અનુસરવી જરૂરી છે ઇન્વેસ્ટર્સ ને.
 </p>

 <p>
 આ ઇન્વેસ્ટમેન્ટ માં તમે જે બસ્સીનેસ માં ઇન્વેસ્ટ કર્યા તેની તમામ બેસિક ડિટેઇસ અથવા પૂરી જાણકારી તમને અમારી ટીમ સાથે <strong>RADHIK MADUM</strong> દ્વારા આપવામાં આવી ત્યાર બાદ તમે પસંદ કરેલ બસ્સીનેસ કંપની માં ઇન્વેસ્ટ કરવાનું પસંદ કરેલ છે ત્યાર બાદ તમારું ઇન્વેસ્ટમેન્ટ કરેલ અમોઉન્ટ તે બસ્સીનેસમેન સુધી 24 કલાક માં અમે પોહચાડી દઈએ છીએ અને તમે અનુશ્રિત સમય મુજબ કંપની જેટલું કમાણી કરે છે તે અમને રેકોર્ડ ડેટા અમારા સુધી આવે તે મુજબ અમે તમને તમે પસંદ કરેલ ઇન્ટરેસ્ટ મુજબ તમારા બેન્ક અકાઉંટ માં પરત કરીશું.
 </p>

 <p>
 જો તમે કોઈ કંપની માં ઇન્વેસ્ટ કરો છો તો તમે અન્ય બીજી કંપની માં અથવા એને એજ કંપની માં પરત ઇન્વેસ્ટ કરવાનું વિચારો છો તે બિલકુલ સક્ય છે તમે બિન્દાસ તમે ઇન્વેસ્ટ કરી શકો છો.
 </p>
 </div>

 <div className="mt-4 sm:mt-4 sm:mt-4 md:mt-8 bg-kite-bg border border-black p-3 sm:p-4 rounded">
 <h4 className="font-medium text-xs md:text-base text-kite-text mb-4 pb-2 border-b border-kite-border">: ખાસ નોંધ :</h4>
 <p className="mb-4 text-justify">
 જો તમે કોઈ બસ્સીનેસ માં ઇન્વેસ્ટ કરો છો તે કોઈ આર્થિક રીતે તે સમય મુજબ તેટલું ઇન્વેસ્ટ નથી કરી શકતું તો તેના માટે મુખ્ય તબકા 2 રહશે જેમાં તમને પર્સનલી કોન્ટેટ કરીને ને જાણકારી લઈ ને અમે તે પગલું ભરીસું. 99% અમારી કંપની માં રજિસ્ટર થયેલ BUSSINESS આર્થિક રીતે મજબૂત જ બને છે અન્ય કોઈ કારણોસર થાઈ તે બદલ તમને જાણકારી આપવી અમારી ફરજ છે.
 </p>
 <ol className="list-decimal pl-6 space-y-4 text-justify">
 <li>
 <span className="font-medium text-kite-text">જો કંપની આર્થિક રીતે તમારા સમયગાળા મુજબ તમે નક્કી કરેલ ઇન્વેસ્ટમેન્ટ જાહેર નથી કરી શકતું</span> તો શું તમે તે સમય પીરિયડ લંબાવા માંગો છો? જો માંગતા હોય તો અમે સમય ગાળો લંબાવી દઈશું અને તે કારણોસર તમને તે બસ્સીનેસ દરમિયાન અમુક ટકા ઇન્ટરેસ્ટ વધારી ને પણ આપીએ છીએ.
 </li>
 <li>
 <span className="font-medium text-kite-text">જો તમારા ટાઈમ પીરિયડ દરમિયાન જો તમે ઇન્વેસ્ટ કરેલ અમોઉન્ટ તમને તાત્કાલિક રૂપે જરૂર હોય</span> અને બસ્સીનેસ કંપની ને આર્થિક સ્થિત ઉપર ના આવી હોય તો અમારી ટીમ તમને તમે રોકેલ વળતર પાછું આપીસુ જે તમે ઇન્ટરેસ્ટ રેટ મુજબ નક્કી કરેલ હતું તે સાથે જે તમને RMAS કંપની પૂરું પાડશે જેથી તમને અમારી કંપની ઉપર કાયમ વિશ્વાસ રહે અને ફરીથી ઇન્વેસ્ટ કરવામાં અનુસૂચિત બનો.
 </li>
 </ol>
 </div>

 <div className="grid grid-cols-2 gap-2 md:gap-4">
 <div>
 <div className="border-b border-kite-border w-48 mx-auto mb-2 h-12"></div>
 <p className="font-medium">Authorized Signatory</p>
 <p className="text-sm font-medium text-kite-text-light">RADHIKA MA SERVICE</p>
 </div>
 <div>
 <div className="border-b border-kite-border w-48 mx-auto mb-2 h-12"></div>
 <p className="font-medium">Investor Signature</p>
 <p className="text-sm font-medium text-kite-text-light">{investor.name}</p>
 </div>
 </div>
 </div>
 );
}

// Component for the Profit Slip
function ProfitSlipContent({ investment, investor, business, isBlueTick, isPreVerified }: { investment: Investment, investor: Investor, business: Business, isBlueTick?: boolean, isPreVerified?: boolean }) {
 const payout = investment.payoutDetails;

 return (
 <div className="space-y-4 sm:space-y-8 leading-relaxed">
 <div className="absolute top-10 right-10 opacity-10">
 <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
 </div>
 <div className="border-b-4 border-black pb-3 sm:pb-6">
 <h1 className="text-xs md:text-base font-medium uppercase tracking-tighter">Radhika Ma Service</h1>
 <h2 className="text-xs md:text-base font-medium tracking-widest text-kite-text-light mt-1">OFFICIAL PROFIT SETTLEMENT SLIP</h2>
 </div>

 <div className="grid grid-cols-2 gap-2 md:gap-4">
 <div>
 <p className="text-xs font-medium uppercase tracking-widest text-kite-text-light mb-1">Investor Information</p>
 <p className="font-medium text-xs md:text-base uppercase">{investor.name}</p>
 <p className="text-sm font-mono mt-1 text-kite-text-light">ID: #{investor.investorId}</p>
 <p className="text-sm font-medium mt-2">Credited Bank: <span className="font-mono">{investor.bankDetails.bankName} (...{investor.bankDetails.accountNumber.slice(-4)})</span></p>
 </div>
 <div>
 <p className="text-xs font-medium uppercase tracking-widest text-kite-text-light mb-1">Business Source</p>
 <div className="flex items-center space-x-2">
 <p className="font-medium text-xs md:text-base uppercase">{business.name}</p>
 {isBlueTick && <BadgeCheck  className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />}
 {isPreVerified && <Clock  className="w-4 h-4 md:w-5 md:h-5 text-black" />}
 </div>
 <p className="text-sm text-kite-text-light mt-1 uppercase">Owner: {business.ownerName}</p>
 <p className="text-sm font-mono mt-1 text-kite-text-light">Bus. ID: #{business.businessId}</p>
 {business.authorityType && business.authorityType !== 'Business Authorities' && (
 <div className="mt-2 text-[10px] font-medium px-2 py-1 bg-kite-blue/10 text-blue-800 rounded-sm w-max border border-kite-blue/30 uppercase tracking-wider">
 {business.authorityType}
 {business.rmasSubsidy ? ` - RMAS Assisted: ${business.rmasSubsidy}% Interest` : ''}
 </div>
 )}
 </div>
 </div>

 <div className="mt-4 md:mt-4 sm:mt-4 md:mt-8 border border-kite-border rounded-sm overflow-x-auto w-full max-w-full">
 <table className="w-full text-left text-xs sm:text-sm">
 <thead className="bg-kite-bg font-medium uppercase text-xs tracking-wider">
 <tr>
 <th className="p-2 sm:p-4 border-b border-kite-border">Description</th>
 <th className="p-2 sm:p-4 border-b border-kite-border text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 text-xs sm:text-base">
 <tr>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 font-medium">Original Invested Capital</td>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-medium">{formatINR(investment.amount)}</td>
 </tr>
 <tr className={`border-b border-kite-border ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'bg-kite-red/10' : 'bg-kite-green/10'}`}>
 <td className={`p-2 sm:p-4 py-1.5 md:py-2 font-medium ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'text-red-800' : 'text-green-800'}`}>
 {((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'Total Market Loss' : 'Total Profit & Interest'}
 </td>
 <td className={`p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-medium ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'text-red-800' : 'text-green-800'}`}>
 {((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? '-' : '+'}{formatINR(Math.abs((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount))}
 </td>
 </tr>
 <tr className="bg-kite-bg border-b-2 border-black">
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-text font-medium uppercase tracking-wider text-xs">Gross Payble Amount</td>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-kite-text font-medium">{formatINR((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0))}</td>
 </tr>
 {business.authorityType && business.rmasSubsidy && business.rmasSubsidy > 0 ? (
 <tr className="bg-kite-blue/10 border-b-2 border-black">
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-blue-900 font-medium text-xs uppercase tracking-wider italic">Of above Gross, RMAS Fund Contribution ({business.rmasSubsidy}%)</td>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-blue-900 font-medium">{formatINR(investment.amount * ((business.rmasSubsidy || 0) / 100))}</td>
 </tr>
 ) : null}
 <tr>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-text font-medium">Less: RMAS Service Commission</td>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono font-medium text-kite-text">-{formatINR(payout?.rmasCommission || 0)}</td>
 </tr>
 <tr className="border-b-[3px] border-black">
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-kite-red font-medium">Less: Happy Muslim Income Tax</td>
 <td className="p-2 sm:p-4 py-1.5 md:py-2 text-right font-mono text-kite-red font-medium">-{formatINR(payout?.happyIncomeTax || 0)}</td>
 </tr>
 </tbody>
 <tfoot className="bg-black text-white">
 <tr>
 <td className="p-1.5 md:p-3 md:p-5 font-medium uppercase tracking-wider text-xs sm:text-base">Net Amount Credited to Investor</td>
 <td className="p-2 sm:p-3 md:p-5 text-right font-mono font-medium text-xs md:text-base">{formatINR(payout?.totalCredited || 0)}</td>
 </tr>
 </tfoot>
 </table>
 </div>

 <div className="space-y-2 sm:space-y-4 text-justify text-xs sm:text-sm mt-4 sm:mt-4 sm:mt-4 md:mt-8 pb-2 sm:pb-4">
 <p className="font-medium">: Settlement Agreement :</p>
 <p>This profit slip serves as the official confirmation of the settlement generated by RADHIKA MA SERVICE. All mentioned deductions (Happy Muslim Income Tax & RMAS Commission) have been accounted for mutually. The calculated Final Net Credited amount has been processed to the registered bank details provided by the investor.</p>
 <p>The business owner ({business.ownerName}) and Investor ({investor.name}) acknowledge this complete withdrawal transaction. For further investments or queries, kindly contact the Radhika Ma Service Team.</p>
 </div>

 <div className="flex justify-between items-end pt-6 sm:pt-12 border-t border-kite-border mt-3 md:mt-6 sm:mt-4 sm:mt-12">
 <div className="text-center">
 <p className="font-medium border-t border-black pt-2 w-48 mx-auto mt-16">Authorized Digital Sign</p>
 <p className="text-xs uppercase text-kite-text-light font-medium mt-1">RMAS Accounts Team</p>
 </div>
 <div className="text-right">
 <p className="text-xs text-kite-text-light">Transaction Date: {new Date().toLocaleDateString('en-IN')}</p>
 <p className="text-xs text-kite-text-light font-mono mt-1">Ref No: RT-{Math.random().toString().slice(2, 10)}</p>
 </div>
 </div>
 </div>
 );
}

