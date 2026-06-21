import React, { useState, useRef } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, Search, Users, Banknote, Building, FileText, Download, X, ArrowLeft, CreditCard, Wallet, CheckCircle, BadgeCheck } from 'lucide-react';
import { Investor, Investment, Business } from '../types';
import { INDIAN_BANKS } from '../utils/indianBanks';
import { downloadElementAsPDF } from '../utils/pdfGenerator';
import { getBlueTickBusinessIds } from '../utils/blueTick';
import { getBaseMarketTrend, useLiveMarketTrend } from '../utils/marketSimulator';

type ViewMode = 'list' | 'add-step-1' | 'add-step-2' | 'withdraw-list' | 'withdraw-calc' | 'withdraw-bank' | 'banking-record';

export default function Investors() {
  const { state, dispatch } = useAppContext();
  const blueTickBusinessIds = getBlueTickBusinessIds(state.businesses, state.investments);
  
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

  const filteredInvestors = state.investors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const newInvestor: Investor = {
      id: `i${Date.now()}`,
      investorId: formData.investorId,
      name: formData.name,
      totalInvested: 0,
      joinDate: new Date().toISOString().split('T')[0],
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        accountHolderName: formData.accountHolderName.toUpperCase()
      },
      rmasServiceCharge: Number(formData.rmasServiceCharge) || 0
    };

    dispatch({ type: 'ADD_INVESTOR', payload: newInvestor });
    setViewMode('list');
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
  const isBlueTick = blueTickBusinessIds.has(businessId);
  const marketTrend = useLiveMarketTrend(businessId, isBlueTick);

  const calculateProfit = () => {
    if (selectedInvestments.length === 0) return { baseProfit: 0, totalProfit: 0, marketProfit: 0, rmasMarketCover: 0, marketTrend: 0, isPremature: false };
    
    let totalPrincipal = 0;
    let totalGuaranteedProfit = 0;
    
    const committed = Number(withdrawFormData.committedMonths) || 12;
    const completed = Number(withdrawFormData.completedMonths) || 12;
    
    selectedInvestments.forEach(inv => {
      totalPrincipal += inv.amount;
      const guaranteedInterestRate = inv.interestRate / 100;
      totalGuaranteedProfit += inv.amount * guaranteedInterestRate * (completed / 12);
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
        rmasMarketCover = totalGuaranteedProfit - marketProfit; 
      }
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
        rmasSubsidyPays += inv.amount * (business.rmasSubsidy! / 100) * (completed / 12);
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

  const goToBanking = (e: React.FormEvent) => {
    e.preventDefault();
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

    selectedInvestments.forEach(inv => {
      const ratio = totalAmount > 0 ? (inv.amount / totalAmount) : (1 / selectedInvestments.length);
      const updatedInvestment: Investment = {
        ...inv,
        status: 'completed',
        payoutDetails: {
          rmasCommission: rmasFee * ratio,
          happyIncomeTax: happyTax * ratio,
          totalCredited: finalPayout * ratio,
          payoutDate: new Date().toISOString()
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
        payoutDate: new Date().toISOString()
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
    <div className="max-w-6xl mx-auto space-y-6 print:m-0 print:p-0">
      
      {/* --- Hide this whole container during print --- */}
      <div className="print:hidden space-y-6">
        {viewMode === 'list' && (
          <>
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">Investors</h2>
                <p className="text-sm text-gray-500 mt-1">Manage network of funders and investors.</p>
              </div>
              <button 
                onClick={startAddInvestor}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Plus size={18} />
                <span>Add Investor</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search investors by name or ID..." 
                  className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-white">
                        <th className="p-4 font-semibold text-gray-900">ID Number</th>
                        <th className="p-4 font-semibold text-gray-900">Name</th>
                        <th className="p-4 font-semibold text-gray-900">Bank Details</th>
                        <th className="p-4 font-semibold text-gray-900 text-right">Total Invested</th>
                        <th className="p-4 font-semibold text-gray-900 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestors.map(investor => (
                        <tr key={`desk_${investor.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-mono text-gray-600 font-medium">#{investor.investorId}</td>
                          <td className="p-4 font-bold text-black">{investor.name}</td>
                          <td className="p-4 text-xs text-gray-500">
                            {investor.bankDetails ? (
                              <div>
                                <div className="font-semibold text-gray-800">{investor.bankDetails.bankName}</div>
                                <div>A/C: {investor.bankDetails.accountNumber}</div>
                              </div>
                            ) : 'Not Provided'}
                          </td>
                          <td className="p-4 font-bold text-black text-right">{formatINR(investor.totalInvested)}</td>
                          <td className="p-4 text-center space-x-2">
                            <button 
                              onClick={() => handleBankingRecordClick(investor)}
                              className="text-gray-500 hover:text-black font-semibold text-xs px-3 py-1.5 border border-gray-200 rounded-lg"
                            >
                              Banking Record
                            </button>
                            <button 
                              onClick={() => handleWithdrawClick(investor)}
                              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg"
                            >
                              Withdraw
                            </button>
                            <button 
                              onClick={() => setPdfInvestor(investor)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg inline-flex items-center space-x-1"
                            >
                              <FileText size={14} />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch({ type: 'DELETE_INVESTOR', payload: investor.id });
                              }}
                              className="text-red-500 hover:text-red-700 font-semibold text-xs px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredInvestors.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No investors found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {filteredInvestors.map(investor => (
                    <div key={`mob_${investor.id}`} className="p-4 bg-white hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-black text-lg">{investor.name}</span>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{investor.investorId}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">Total Invested</p>
                          <p className="font-bold text-sm text-black">{formatINR(investor.totalInvested)}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <p className="text-xs text-gray-500 mb-1">Bank Details</p>
                          {investor.bankDetails ? (
                            <div className="text-xs flex justify-between">
                              <span className="font-semibold text-gray-800">{investor.bankDetails.bankName}</span> 
                              <span className="text-gray-600 ml-2">A/C: {investor.bankDetails.accountNumber}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not Provided</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleBankingRecordClick(investor)}
                          className="flex-1 text-gray-700 font-semibold text-xs px-3 py-2 border border-gray-200 rounded-lg text-center whitespace-nowrap min-w-[120px]"
                        >
                          Banking Record
                        </button>
                        <button 
                          onClick={() => handleWithdrawClick(investor)}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs px-3 py-2 rounded-lg text-center whitespace-nowrap min-w-[80px]"
                        >
                          Withdraw
                        </button>
                        <button 
                          onClick={() => setPdfInvestor(investor)}
                          className="bg-blue-50 text-blue-600 font-semibold text-xs px-3 py-2 rounded-lg text-center flex justify-center items-center space-x-1 whitespace-nowrap"
                        >
                          <FileText size={14} />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'DELETE_INVESTOR', payload: investor.id });
                          }}
                          className="text-red-500 font-semibold text-xs px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-center whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredInvestors.length === 0 && (
                    <div className="p-8 text-center text-gray-500 font-medium">No investors found.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'add-step-1' && (
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center space-x-2">
              <Users size={22} className="text-gray-800" />
              <span>Step 1: Investor Basic Profile</span>
            </h3>
            <form onSubmit={handleNextStep} className="space-y-6">
               <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Investor ID Number (Auto-Generated)</label>
                <input 
                  type="text" 
                  readOnly 
                  className="w-full border border-gray-300 bg-gray-50 text-gray-500 font-mono rounded-lg p-3 outline-none cursor-not-allowed" 
                  value={formData.investorId} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Investor Full Name</label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium focus:ring-2 focus:ring-black outline-none" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Enter full name..." 
                />
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setViewMode('list')} className="px-6 py-2.5 font-semibold text-gray-500 hover:text-black">Cancel</button>
                <button type="submit" className="bg-black hover:bg-gray-800 text-white px-8 py-2.5 rounded-lg font-bold transition-colors">Next Page →</button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'add-step-2' && (
          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-4 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center space-x-2">
              <Banknote size={22} className="text-gray-800" />
              <span>Step 2: BANKING PROCESS</span>
            </h3>
            <form onSubmit={handleVerifiedSave} className="space-y-6">
               
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center space-x-1">
                    <Building size={16} /> <span>Bank Name</span>
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none bg-white font-medium shadow-sm"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  >
                    {INDIAN_BANKS.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Account Number</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono focus:ring-2 focus:ring-black outline-none shadow-sm" 
                    value={formData.accountNumber} 
                    onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} 
                    placeholder="e.g. 30291039482" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">IFSC Code</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 font-mono uppercase focus:ring-2 focus:ring-black outline-none shadow-sm" 
                    value={formData.ifscCode} 
                    onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} 
                    placeholder="e.g. SBIN0001234" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Account Holder Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 bg-white rounded-lg p-3 font-bold text-black uppercase focus:ring-2 focus:ring-black outline-none shadow-sm" 
                    value={formData.accountHolderName} 
                    onChange={e => setFormData({...formData, accountHolderName: e.target.value.toUpperCase()})} 
                  />
                  <p className="text-xs text-gray-500 mt-2">Auto-filled from Step 1. You can edit if bank account name differs.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">RADHIKA MA SERVICE CHARGE (₹)</label>
                <input 
                  required 
                  type="number" 
                  className="w-full md:w-1/2 border border-blue-300 bg-blue-50/50 rounded-lg p-3 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                  value={formData.rmasServiceCharge} 
                  onChange={e => setFormData({...formData, rmasServiceCharge: e.target.value})} 
                  placeholder="Enter amount..." 
                />
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setViewMode('add-step-1')} className="px-6 py-2.5 font-semibold text-gray-500 hover:text-black">← Back</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm">✓ Verified Investors</button>
              </div>
            </form>
          </div>
        )}
        {viewMode === 'withdraw-list' && selectedInvestor && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-black flex items-center space-x-2">
                  <span>Withdrawal Mode: {selectedInvestor.name}</span>
                </h3>
                <p className="text-xs text-gray-500">Select an investment to withdraw and credit the investor.</p>
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
                  <div key={bizId} className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between bg-gray-50">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded font-bold">Total QTY: {groupInvs.length}</span>
                        <h4 className="font-bold text-lg text-black">{business?.name || 'Unknown Business'}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Owner: {business?.ownerName} | Bus. ID: {business?.businessId}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{activeInvs.length} Active | {completedInvs.length} Withdrawn</p>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-center">
                      <p className="font-black text-xl text-black">{formatINR(totalAmount)}</p>
                      <p className="text-sm font-semibold text-green-600 mb-3">{activeInvs[0]?.interestRate || completedInvs[0]?.interestRate || 0}% Interest</p>
                      {activeInvs.length > 0 ? (
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-2">
                            <label className="text-xs font-bold text-gray-600 uppercase">Withdraw QTY:</label>
                            <select 
                              value={currentQty}
                              onChange={e => setWithdrawQtyMap({...withdrawQtyMap, [bizId]: Number(e.target.value)})}
                              className="border border-gray-300 rounded p-1 text-sm font-bold bg-white"
                            >
                              {Array.from({length: activeInvs.length}, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          <button 
                            onClick={() => handleCreditInvestorClick(activeInvs.slice(0, currentQty))}
                            className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Credit Investor
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-lg text-sm">
                          <CheckCircle size={16} className="mr-2" /> ALL WITHDRAWN
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {state.investments.filter(i => i.investorId === selectedInvestor.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">No investments found for this investor.</div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'withdraw-calc' && selectedInvestments.length > 0 && selectedInvestor && (
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 md:p-8 shadow-sm">
            <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
              <button onClick={() => setViewMode('withdraw-list')} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-black flex items-center space-x-2">
                  <Wallet size={20} className="text-blue-600" />
                  <span>Withdrawal Payout Setup</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedInvestor.name} → {state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.name}</p>
              </div>
            </div>

            <form onSubmit={goToBanking} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-semibold text-blue-900">Original Investment Amount ({selectedInvestments.length} Qty):</span>
                   <span className="text-lg font-black text-blue-900">{formatINR(selectedInvestments.reduce((s, i) => s + i.amount, 0))}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-semibold text-blue-900">Current Market Trend:</span>
                   <span className={`text-lg font-bold ${calculateProfit().marketTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                     {calculateProfit().marketTrend > 0 ? '+' : ''}{calculateProfit().marketTrend.toFixed(2)}%
                   </span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                   <span className="text-sm font-semibold text-blue-900">Projected Return (Before deductions):</span>
                   <span className={`text-lg font-bold ${calculateProfit().totalProfit < 0 ? 'text-red-600' : 'text-green-700'}`}>
                     {calculateProfit().totalProfit < 0 ? '-' : '+'}{formatINR(Math.abs(calculateProfit().totalProfit))}
                   </span>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Term Validation</label>
                <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200 mb-3">
                  Enter the committed months and the actual completed months. The live market algorithm will automatically calculate the profit or loss.
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Committed Term (Months)</label>
                    <input 
                      required
                      readOnly
                      type="number" 
                      className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-lg p-2.5 outline-none font-bold cursor-not-allowed" 
                      value={withdrawFormData.committedMonths} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Completed Term (Months)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none font-bold" 
                      value={withdrawFormData.completedMonths} 
                      onChange={e => setWithdrawFormData({...withdrawFormData, completedMonths: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">RMAS Commission (₹)</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-3 font-bold focus:ring-2 focus:ring-black outline-none" 
                    value={withdrawFormData.rmasCommission} 
                    onChange={e => setWithdrawFormData({...withdrawFormData, rmasCommission: e.target.value})} 
                    placeholder="e.g. 5000" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Deducted from both parties</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-red-600">Happy Muslim Income Tax (₹)</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full border border-red-300 bg-red-50 rounded-lg p-3 font-bold focus:ring-2 focus:ring-red-500 outline-none" 
                    value={withdrawFormData.happyIncomeTax} 
                    onChange={e => setWithdrawFormData({...withdrawFormData, happyIncomeTax: e.target.value})} 
                    placeholder="e.g. 2000" 
                  />
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 font-semibold">Total Profit/Loss</span>
                  <span className={`font-bold ${calculateProfit().totalProfit < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {calculateProfit().totalProfit < 0 ? '-' : '+'}{formatINR(Math.abs(calculateProfit().totalProfit))}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                  <span className="text-white font-bold uppercase tracking-widest text-xs">Gross Payable (Capital + PnL)</span>
                  <span className="font-bold text-white">{formatINR(selectedInvestments.reduce((sum, inv) => sum + inv.amount, 0) + calculateProfit().totalProfit)}</span>
                </div>
                <div className="flex justify-between items-center mb-2 pt-2">
                  <span className="text-gray-400 font-semibold">Total Deductions (Comm + Tax)</span>
                  <span className="font-bold text-red-400">-{formatINR((Number(withdrawFormData.rmasCommission) || 0) + (Number(withdrawFormData.happyIncomeTax) || 0))}</span>
                </div>
                <div className="border-t border-gray-700 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Total Final Credited</span>
                  <span className="text-3xl font-black">{formatINR(calculateFinalPayout())}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold text-lg flex items-center space-x-2 transition-colors">
                  <span>Proceed to Banking</span>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'withdraw-bank' && selectedInvestments.length > 0 && selectedInvestor && (
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-4 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-black mb-8 text-center flex items-center justify-center space-x-2">
              <CreditCard size={28} />
              <span>FINAL BANKING SETTLEMENT</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Debit Side (Business) */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center space-x-2 mb-4 text-red-800">
                  <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center font-bold">DR</div>
                  <h4 className="font-bold text-lg">DEBIT FROM (Business)</h4>
                </div>
                
                {state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails ? (
                  <div className="space-y-3 bg-white p-4 rounded-lg border border-red-100">
                    <p className="font-bold text-gray-900">{state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.bankName}</p>
                    <div className="font-mono text-sm">
                      <p className="text-gray-600">A/C: <span className="text-black font-semibold">{state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.accountNumber}</span></p>
                      <p className="text-gray-600">IFSC: <span className="text-black font-semibold">{state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.ifscCode}</span></p>
                    </div>
                    <p className="text-xs font-bold text-gray-500">HOLDER: {state.businesses.find(b => b.id === selectedInvestments[0].businessId)?.bankDetails?.accountHolderName}</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-red-100 text-sm font-semibold text-red-600 text-center">
                    No bank details found for this business.
                  </div>
                )}
                
                {calculateBusinessBurden().totalRmasContribution > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-bold text-blue-800 uppercase mb-1">RMAS Fund Contributions Applied</p>
                    {calculateBusinessBurden().rmasSubsidyPays > 0 && (
                      <p className="text-sm text-blue-900 mb-1 flex justify-between">
                        <span>Government Subsidy:</span>
                        <span className="font-bold">{formatINR(calculateBusinessBurden().rmasSubsidyPays)}</span>
                      </p>
                    )}
                    {calculateBusinessBurden().rmasMarketCover > 0 && (
                      <p className="text-sm text-blue-900 flex justify-between">
                        <span>Market Deficit Cover:</span>
                        <span className="font-bold">{formatINR(calculateBusinessBurden().rmasMarketCover)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Credit Side (Investor) */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-4 text-green-800">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center font-bold">CR</div>
                  <h4 className="font-bold text-lg">CREDIT TO (Investor)</h4>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-lg border border-green-100">
                  <p className="font-bold text-gray-900">{selectedInvestor.bankDetails.bankName}</p>
                  <div className="font-mono text-sm">
                    <p className="text-gray-600">A/C: <span className="text-black font-semibold">{selectedInvestor.bankDetails.accountNumber}</span></p>
                    <p className="text-gray-600">IFSC: <span className="text-black font-semibold">{selectedInvestor.bankDetails.ifscCode}</span></p>
                  </div>
                  <p className="text-xs font-bold text-gray-500">HOLDER: {selectedInvestor.bankDetails.accountHolderName}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Amount to Transfer</p>
                <p className="text-3xl font-black text-black mt-1">{formatINR(calculateFinalPayout())}</p>
              </div>
              <div className="text-right">
                {calculateBusinessBurden().totalRmasContribution > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-gray-600">
                      Business Pays: <span className="font-bold">{formatINR(calculateBusinessBurden().businessPays)}</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      RMAS Fund Pays: <span className="font-bold">{formatINR(calculateBusinessBurden().totalRmasContribution)}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-gray-500">Includes all deductions</p>
                )}
                <p className="text-sm font-semibold text-gray-500">Generating Profit Slip on Success</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button onClick={() => setViewMode('withdraw-calc')} className="px-6 py-3 font-bold text-gray-600 hover:text-black">Modify Amount</button>
              <button onClick={handlePay} className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded-xl font-black text-lg shadow-lg flex items-center space-x-2 transition-all hover:scale-105 active:scale-95">
                <CreditCard size={24} />
                <span>PAY NOW</span>
              </button>
            </div>
          </div>
        )}

        {viewMode === 'banking-record' && selectedInvestor && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-5xl mx-auto">
            <div className="flex items-center mb-6">
              <button onClick={() => setViewMode('list')} className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-black flex items-center space-x-2">
                  <CreditCard size={20} className="text-gray-500" />
                  <span>Banking & Tax Records: {selectedInvestor.name}</span>
                </h3>
                <p className="text-xs text-gray-500">View all completed investments, paid profits, and generated slips for this investor.</p>
              </div>
            </div>

            <div className="space-y-4">
              {state.investments.filter(i => i.investorId === selectedInvestor.id && i.status === 'completed').sort((a,b) => getTime(b.id) - getTime(a.id)).map((inv) => {
                const business = state.businesses.find(b => b.id === inv.businessId);
                const payout = inv.payoutDetails;
                return (
                  <div key={inv.id} className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={18} className="text-green-500" />
                        <h4 className="font-bold text-lg text-black">{business?.name || 'Unknown Business'}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Paid On: {payout?.payoutDate ? new Date(payout.payoutDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">Inv. ID: #{inv.id}</p>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                       <div className="text-right">
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Invested</p>
                         <p className="font-bold text-black">{formatINR(inv.amount)}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Returned</p>
                         <p className="font-black text-green-700">{formatINR(payout?.totalCredited || 0)}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Tax Paid</p>
                         <p className="font-bold text-red-600">{formatINR(payout?.happyIncomeTax || 0)}</p>
                       </div>
                       <div className="border-l border-gray-200 pl-8">
                         <button 
                           onClick={() => setPdfProfitSlip({ investment: inv, investor: selectedInvestor, business: business! })}
                           className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                         >
                           <FileText size={16} />
                           <span>View Slip</span>
                         </button>
                       </div>
                    </div>
                  </div>
                );
              })}
              {state.investments.filter(i => i.investorId === selectedInvestor.id && i.status === 'completed').length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                  <CreditCard size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-semibold text-gray-700">No completed banking records found.</p>
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
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg text-black flex items-center space-x-2">
                <CheckCircle className="text-green-500" />
                <span>Withdrawal Successful & Profit Slip Generated</span>
              </h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePrintProfitSlip}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 flex items-center space-x-2 rounded-lg font-semibold transition"
                >
                  <Download size={16} />
                  <span>Download / Print Slip</span>
                </button>
                <button 
                  onClick={() => setPdfProfitSlip(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div id="profit-slip-content" className="bg-white shadow-sm border border-gray-200 mx-auto max-w-[800px] p-6 md:p-12 text-gray-900 border-l-[16px] border-l-black relative overflow-hidden">
                <ProfitSlipContent 
                  investment={pdfProfitSlip.investment} 
                  investor={pdfProfitSlip.investor} 
                  business={pdfProfitSlip.business} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFIT SLIP PRINT VIEW --- */}
      {pdfProfitSlip && (
        <div className="hidden print:block font-sans text-black">
           <ProfitSlipContent 
             investment={pdfProfitSlip.investment} 
             investor={pdfProfitSlip.investor} 
             business={pdfProfitSlip.business} 
           />
        </div>
      )}

      {/* --- PDF Modal Preview (Only visible when pdfInvestor is set, hidden during print) --- */}
      {pdfInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg text-black">Preview PDF Document</h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePrintInvestorPDF}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 flex items-center space-x-2 rounded-lg font-semibold transition"
                >
                  <Download size={16} />
                  <span>Download / Print</span>
                </button>
                <button 
                  onClick={() => setPdfInvestor(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Provide a visual boundary for the user before printing */}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div id="investor-pdf-content" className="bg-white shadow-sm border border-gray-200 mx-auto max-w-3xl p-6 md:p-12 aspect-auto text-gray-900">
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
        <div className="hidden print:block font-sans text-black p-0 m-0">
           <PdfContent investor={pdfInvestor} />
        </div>
      )}

    </div>
  );
}

// Sub-component for the PDF Content to ensure it's rendered identically in Preview and Print
function PdfContent({ investor }: { investor: Investor }) {
  return (
    <div className="space-y-8 leading-relaxed">
      <div className="text-center space-y-2 border-b-2 border-black pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-widest text-black">RADHIKA MA SERVICE</h1>
        <h2 className="text-xl font-bold text-gray-700 mt-2">INVESTMENT SERVICE GUIDELINES RULES</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Investor Details</p>
          <p className="font-bold text-lg mt-1 text-black">{investor.name}</p>
          <p className="font-mono text-sm text-gray-600 mt-0.5">ID: #{investor.investorId}</p>
          <p className="text-sm text-gray-600 mt-0.5">Joined: {new Date(investor.joinDate).toLocaleDateString('en-IN')}</p>
        </div>
        {investor.bankDetails && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Banking Profile</p>
            <p className="font-bold text-black mt-1">{investor.bankDetails.bankName}</p>
            <p className="font-mono text-sm text-gray-600 mt-0.5">A/C: {investor.bankDetails.accountNumber}</p>
            <p className="font-mono text-sm text-gray-600 mt-0.5">IFSC: {investor.bankDetails.ifscCode}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">ACCOUNT HOLDER: {investor.bankDetails.accountHolderName}</p>
          </div>
        )}
      </div>

      <div className="space-y-5 text-justify text-base">
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

      <div className="mt-8 bg-gray-50 border border-black p-6 rounded">
        <h4 className="font-bold text-lg text-black mb-4 pb-2 border-b border-gray-300">: ખાસ નોંધ :</h4>
        <p className="mb-4 text-justify">
          જો તમે કોઈ બસ્સીનેસ માં ઇન્વેસ્ટ કરો છો તે કોઈ આર્થિક રીતે તે સમય મુજબ તેટલું ઇન્વેસ્ટ નથી કરી શકતું તો તેના માટે મુખ્ય તબકા 2 રહશે જેમાં તમને પર્સનલી કોન્ટેટ કરીને ને જાણકારી લઈ ને અમે તે પગલું ભરીસું. 99% અમારી કંપની માં રજિસ્ટર થયેલ BUSSINESS આર્થિક રીતે મજબૂત જ બને છે અન્ય કોઈ કારણોસર થાઈ તે બદલ તમને જાણકારી આપવી અમારી ફરજ છે.
        </p>
        <ol className="list-decimal pl-6 space-y-4 text-justify">
          <li>
            <span className="font-semibold text-black">જો કંપની આર્થિક રીતે તમારા સમયગાળા મુજબ તમે નક્કી કરેલ ઇન્વેસ્ટમેન્ટ જાહેર નથી કરી શકતું</span> તો શું તમે તે સમય પીરિયડ લંબાવા માંગો છો? જો માંગતા હોય તો અમે સમય ગાળો લંબાવી દઈશું અને તે કારણોસર તમને તે બસ્સીનેસ દરમિયાન અમુક ટકા ઇન્ટરેસ્ટ વધારી ને પણ આપીએ છીએ.
          </li>
          <li>
            <span className="font-semibold text-black">જો તમારા ટાઈમ પીરિયડ દરમિયાન જો તમે ઇન્વેસ્ટ કરેલ અમોઉન્ટ તમને તાત્કાલિક રૂપે જરૂર હોય</span> અને બસ્સીનેસ કંપની ને આર્થિક સ્થિત ઉપર ના આવી હોય તો અમારી ટીમ તમને તમે રોકેલ વળતર પાછું આપીસુ જે તમે ઇન્ટરેસ્ટ રેટ મુજબ નક્કી કરેલ હતું તે સાથે જે તમને RMAS કંપની પૂરું પાડશે જેથી તમને અમારી કંપની ઉપર કાયમ વિશ્વાસ રહે અને ફરીથી ઇન્વેસ્ટ કરવામાં અનુસૂચિત બનો.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-2 h-12"></div>
          <p className="font-bold">Authorized Signatory</p>
          <p className="text-sm font-semibold text-gray-500">RADHIKA MA SERVICE</p>
        </div>
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-2 h-12"></div>
          <p className="font-bold">Investor Signature</p>
          <p className="text-sm font-semibold text-gray-500">{investor.name}</p>
        </div>
      </div>
    </div>
  );
}

// Component for the Profit Slip
function ProfitSlipContent({ investment, investor, business, isBlueTick }: { investment: Investment, investor: Investor, business: Business, isBlueTick?: boolean }) {
  const payout = investment.payoutDetails;

  return (
    <div className="space-y-8 leading-relaxed">
      <div className="absolute top-10 right-10 opacity-10">
        <CreditCard size={120} />
      </div>
      <div className="border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Radhika Ma Service</h1>
        <h2 className="text-xl font-bold tracking-widest text-gray-500 mt-1">OFFICIAL PROFIT SETTLEMENT SLIP</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Investor Information</p>
          <p className="font-bold text-2xl uppercase">{investor.name}</p>
          <p className="text-sm font-mono mt-1 text-gray-600">ID: #{investor.investorId}</p>
          <p className="text-sm font-semibold mt-2">Credited Bank: <span className="font-mono">{investor.bankDetails.bankName} (...{investor.bankDetails.accountNumber.slice(-4)})</span></p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Business Source</p>
          <div className="flex items-center space-x-2">
            <p className="font-bold text-xl uppercase">{business.name}</p>
            {isBlueTick && <BadgeCheck size={20} className="text-blue-500 fill-white" />}
          </div>
          <p className="text-sm text-gray-600 mt-1 uppercase">Owner: {business.ownerName}</p>
          <p className="text-sm font-mono mt-1 text-gray-600">Bus. ID: #{business.businessId}</p>
          {business.authorityType && business.authorityType !== 'Business Authorities' && (
            <div className="mt-2 text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-800 rounded w-max border border-blue-200 uppercase tracking-wider">
              {business.authorityType}
              {business.rmasSubsidy ? ` - RMAS Assisted: ${business.rmasSubsidy}% Interest` : ''}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border border-gray-300 rounded overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="bg-gray-100 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 border-b border-gray-300">Description</th>
              <th className="p-4 border-b border-gray-300 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-base">
            <tr>
              <td className="p-4 py-3 font-semibold">Original Invested Capital</td>
              <td className="p-4 py-3 text-right font-mono font-semibold">{formatINR(investment.amount)}</td>
            </tr>
            <tr className={`border-b border-gray-300 ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <td className={`p-4 py-3 font-semibold ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'text-red-800' : 'text-green-800'}`}>
                {((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'Total Market Loss' : 'Total Profit & Interest'}
              </td>
              <td className={`p-4 py-3 text-right font-mono font-bold ${((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? 'text-red-800' : 'text-green-800'}`}>
                {((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount) < 0 ? '-' : '+'}{formatINR(Math.abs((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0) - investment.amount))}
              </td>
            </tr>
            <tr className="bg-gray-100 border-b-2 border-black">
              <td className="p-4 py-3 text-black font-bold uppercase tracking-wider text-xs">Gross Payble Amount</td>
              <td className="p-4 py-3 text-right font-mono text-black font-bold">{formatINR((payout?.totalCredited || 0) + (payout?.rmasCommission || 0) + (payout?.happyIncomeTax || 0))}</td>
            </tr>
            {business.authorityType && business.rmasSubsidy && business.rmasSubsidy > 0 ? (
              <tr className="bg-blue-50 border-b-2 border-black">
                <td className="p-4 py-3 text-blue-900 font-bold text-xs uppercase tracking-wider italic">Of above Gross, RMAS Fund Contribution ({business.rmasSubsidy}%)</td>
                <td className="p-4 py-3 text-right font-mono text-blue-900 font-bold">{formatINR(investment.amount * ((business.rmasSubsidy || 0) / 100))}</td>
              </tr>
            ) : null}
            <tr>
              <td className="p-4 py-3 text-gray-700 font-semibold">Less: RMAS Service Commission</td>
              <td className="p-4 py-3 text-right font-mono font-bold text-gray-700">-{formatINR(payout?.rmasCommission || 0)}</td>
            </tr>
            <tr className="border-b-[3px] border-black">
              <td className="p-4 py-3 text-red-700 font-semibold">Less: Happy Muslim Income Tax</td>
              <td className="p-4 py-3 text-right font-mono text-red-700 font-bold">-{formatINR(payout?.happyIncomeTax || 0)}</td>
            </tr>
          </tbody>
          <tfoot className="bg-black text-white">
            <tr>
              <td className="p-5 font-bold uppercase tracking-wider text-base">Net Amount Credited to Investor</td>
              <td className="p-5 text-right font-mono font-black text-xl">{formatINR(payout?.totalCredited || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="space-y-4 text-justify text-sm mt-8 pb-4">
        <p className="font-semibold">: Settlement Agreement :</p>
        <p>This profit slip serves as the official confirmation of the settlement generated by RADHIKA MA SERVICE. All mentioned deductions (Happy Muslim Income Tax & RMAS Commission) have been accounted for mutually. The calculated Final Net Credited amount has been processed to the registered bank details provided by the investor.</p>
        <p>The business owner ({business.ownerName}) and Investor ({investor.name}) acknowledge this complete withdrawal transaction. For further investments or queries, kindly contact the Radhika Ma Service Team.</p>
      </div>

      <div className="flex justify-between items-end pt-12 border-t border-gray-300 mt-12">
        <div className="text-center">
          <p className="font-bold border-t border-black pt-2 w-48 mx-auto mt-16">Authorized Digital Sign</p>
          <p className="text-xs uppercase text-gray-500 font-semibold mt-1">RMAS Accounts Team</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Transaction Date: {new Date().toLocaleDateString('en-IN')}</p>
          <p className="text-xs text-gray-500 font-mono mt-1">Ref No: RT-{Math.random().toString().slice(2, 10)}</p>
        </div>
      </div>
    </div>
  );
}

