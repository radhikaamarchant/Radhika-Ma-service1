import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { ArrowLeft, Building2, Save, X, Edit2, Shield, AlertCircle, BadgeCheck, Clock, Wallet, ArrowDownRight, ArrowUpRight, FileText, ImageIcon, Upload, User, TrendingUp } from 'lucide-react';
import { Business } from '../types';
import { getVerificationStats } from '../utils/blueTick';
import { getUnifiedBankBalance, getUnifiedTransactions } from '../utils/bankBalance';
import { MarketTrendCell } from './MarketTrendCell';

interface Props {
  businessId: string;
  onBack: () => void;
  onDelete?: () => void;
}

export default function BusinessDetail({ businessId, onBack, onDelete }: Props) {
  const { state, dispatch } = useAppContext();
  const business = state.businesses.find(b => b.id === businessId);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'details' | 'bank'>('details');
  const statsMap = getVerificationStats(state.businesses, state.investments);
  const vStats = statsMap.get(businessId);
  const isBlueTick = vStats?.isBlueTick ?? false;
  const isPreVerified = vStats?.isPreVerified ?? false;

  const [formData, setFormData] = useState({
    fundingRequired: business?.fundingRequired.toString() || '0',
    interestRate: business?.interestRate.toString() || '0',
    status: business?.status || 'listed',
    name: business?.name || '',
    description: business?.description || '',
    location: business?.location || '',
    photoUrl: business?.photoUrl || '',
  });

  useEffect(() => {
    if (business && !isEditing) {
      setFormData({
        fundingRequired: (business.fundingRequired || 0).toString(),
        interestRate: (business.interestRate || 0).toString(),
        status: business.status || 'listed',
        name: business.name || '',
        description: business.description || '',
        location: business.location || '',
        photoUrl: business.photoUrl || '',
      });
    }
  }, [business, isEditing]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!business) return null;

  const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;
  const businessInvestments = state.investments
    .filter(inv => inv.businessId === businessId)
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const activeBusinessInvestments = businessInvestments.filter(i => i.status !== 'completed');
  const totalFunded = activeBusinessInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_BUSINESS',
      payload: {
        ...business,
        fundingRequired: parseFloat(formData.fundingRequired),
        interestRate: parseFloat(formData.interestRate),
        status: formData.status as Business['status'],
        name: formData.name,
        description: formData.description,
        location: formData.location,
        photoUrl: formData.photoUrl,
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fundingRequired: business.fundingRequired.toString(),
      interestRate: business.interestRate.toString(),
      status: business.status,
      name: business.name || '',
      description: business.description || '',
      location: business.location || '',
      photoUrl: business.photoUrl || '',
    });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setFormData({ ...formData, photoUrl: reader.result?.toString() || '' });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const unifiedBalance = business ? getUnifiedBankBalance(business.ownerName, state.businesses, state.investors, state.investments, state.settings) : 0;
  
  const bankTransactions = business ? getUnifiedTransactions(business.ownerName, state.businesses, state.investors, state.investments, state.settings) : [];

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in transition-all pb-20">
      {/* Header Section */}
      <div className="flex items-start md:items-center space-x-3 mb-4 md:mb-6 border-b border-kite-border pb-4 md:pb-6">
        <button onClick={onBack}
          className="p-1.5 -ml-1.5 hover:bg-kite-bg rounded transition-colors text-kite-text mt-0.5 md:mt-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-medium text-kite-text tracking-tight flex items-center space-x-2">
              <span className="truncate max-w-[250px] md:max-w-md">{business.name}</span>
              {isBlueTick && <BadgeCheck className="w-4 h-4 text-white fill-blue-500 shrink-0" title="RMAS Verified" />}
              {isPreVerified && <Clock className="w-4 h-4 text-black shrink-0" title="Pre-Verified" />}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] md:text-xs text-kite-text-light mt-0.5">
              <span className="font-mono">ID: #{business.businessId}</span>
              <span className="text-kite-border">•</span>
              <span className="font-medium">{business.ownerName}</span>
            </div>
          </div>
          <div className="mt-2 md:mt-0">
             <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${business.status === 'listed' ? 'bg-kite-green/10 text-kite-green' : business.status === 'funded' ? 'bg-kite-text text-white' : 'bg-kite-bg text-kite-text-light'}`}>
               {business.status}
             </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <button
          onClick={() => { setViewMode(viewMode === 'bank' ? 'details' : 'bank'); setIsEditing(false); }}
          className={`flex flex-col items-center justify-center space-y-1.5 py-3 px-2 rounded border transition-all duration-200 active:bg-gray-50 min-h-[56px] shadow-sm hover:shadow-md ${viewMode === 'bank' && !isEditing ? 'border-kite-blue bg-kite-blue/5 text-kite-blue' : 'border-kite-border bg-white text-kite-text'}`}
        >
          <Wallet className="w-5 h-5 shrink-0" />
          <span className="font-medium text-[11px] md:text-xs tracking-wide">{viewMode === 'bank' && !isEditing ? 'Hide Details' : 'Bank Balance'}</span>
        </button>
        <button
          onClick={() => { setIsEditing(!isEditing); setViewMode('details'); }}
          className={`flex flex-col items-center justify-center space-y-1.5 py-3 px-2 rounded border transition-all duration-200 active:bg-gray-50 min-h-[56px] shadow-sm hover:shadow-md ${isEditing ? 'border-kite-blue bg-kite-blue/5 text-kite-blue' : 'border-kite-border bg-white text-kite-text'}`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="font-medium text-[11px] md:text-xs tracking-wide">{isEditing ? 'Hide Profile' : 'Your Profile'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-kite-border p-3 md:p-4 rounded">
          <p className="text-[10px] md:text-xs text-kite-text-light uppercase tracking-wider mb-1 font-medium">Funding Req.</p>
          <p className="text-base md:text-xl font-medium text-kite-text">{formatINR(business.fundingRequired)}</p>
        </div>
        <div className="bg-white border border-kite-border p-3 md:p-4 rounded">
          <p className="text-[10px] md:text-xs text-kite-text-light uppercase tracking-wider mb-1 font-medium">Interest Rate</p>
          <p className="text-base md:text-xl font-medium text-kite-green">{business.interestRate}%</p>
        </div>
        <div className="bg-white border border-kite-border p-3 md:p-4 rounded">
          <p className="text-[10px] md:text-xs text-kite-text-light uppercase tracking-wider mb-1 font-medium">Total Funded</p>
          <p className="text-base md:text-xl font-medium text-kite-blue">{formatINR(totalFunded)}</p>
        </div>
        <div className="bg-white border border-kite-border p-3 md:p-4 rounded">
          <p className="text-[10px] md:text-xs text-kite-text-light uppercase tracking-wider mb-1 font-medium">Investors</p>
          <p className="text-base md:text-xl font-medium text-kite-text">{activeBusinessInvestments.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Left Column (Holdings / Profile) */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {viewMode === 'bank' && !isEditing ? (
              <div className="bg-white border border-kite-border rounded p-4 md:p-6 animate-fade-in min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-6 border-b border-kite-border">
                  <p className="text-[10px] md:text-xs text-kite-text-light uppercase tracking-wider mb-2">Available balance</p>
                  <p className={`text-3xl md:text-4xl font-medium tracking-tight ${unifiedBalance >= 0 ? "text-kite-blue" : "text-kite-red"}`}>
                    {unifiedBalance >= 0 ? '' : '-'}{formatINR(Math.abs(unifiedBalance))}
                  </p>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-kite-text mb-3">Recent Transactions</h4>
                  {bankTransactions.length > 0 ? (
                    <div className="divide-y divide-kite-border">
                      {bankTransactions.map(tx => (
                        <div key={tx.id} className="py-3 flex justify-between items-start hover:bg-kite-bg/50 transition-colors">
                          <div>
                            <p className="text-sm text-kite-text font-medium flex items-center space-x-2">
                              <span>{tx.title}</span>
                              {tx.category === 'commission' && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] uppercase tracking-wider font-semibold">Commission</span>}
                              {tx.category === 'sahay' && <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] uppercase tracking-wider font-semibold">Sahay</span>}
                            </p>
                            <p className="text-xs text-kite-text-light mt-0.5">{tx.description}</p>
                            <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
                          </div>
                          <p className={`text-sm font-medium ${tx.type === 'CREDIT' ? 'text-kite-green' : 'text-kite-text'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{formatINR(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-kite-text-light text-sm">
                      No transactions recorded yet.
                    </div>
                  )}
                </div>
              </div>
          ) : isEditing ? (
              <div className="bg-white border border-kite-border rounded p-4 md:p-6 animate-fade-in space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border border-kite-border bg-kite-bg flex flex-col items-center justify-center relative group">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-kite-text-light flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 mb-1 opacity-50" />
                        <span className="text-[9px] font-medium uppercase tracking-wider text-center">No Photo</span>
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-5 h-5 md:w-6 md:h-6 mb-1" />
                      <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">Upload</span>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Business Name</label>
                    <input type="text" className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Business Name" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Description</label>
                    <textarea className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none resize-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="About the business..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Location</label>
                    <input type="text" className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City, State" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Status</label>
                    <select className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="listed">Listed</option>
                      <option value="funded">Funded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Funding Required (₹)</label>
                    <input type="number" className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none" value={formData.fundingRequired} onChange={e => setFormData({...formData, fundingRequired: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">Interest Rate (%)</label>
                    <input type="number" step="0.1" className="w-full border border-kite-border rounded px-3 py-2 bg-transparent text-sm font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} />
                  </div>
                </div>

                <div className="mt-6 border-t border-kite-border pt-4">
                  <div className="p-2 bg-orange-50 border border-orange-100 rounded flex items-start space-x-2 text-orange-800 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">Changing financial parameters only applies to future entries.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    {onDelete && (
                      <button onClick={() => { onDelete(); }} className="w-full sm:w-auto bg-white text-kite-red border border-red-200 hover:bg-red-50 hover:border-red-300 font-medium text-sm px-4 py-2 rounded transition-colors text-center">
                        Delete Business
                      </button>
                    )}
                    <div className="flex space-x-2 w-full sm:w-auto justify-end flex-1">
                      <button onClick={handleCancel} className="flex-1 sm:flex-none text-center bg-white text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-sm px-4 py-2 rounded transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSave} className="flex-1 sm:flex-none text-center bg-kite-blue hover:opacity-90 text-white font-medium text-sm px-4 py-2 rounded transition-colors shadow-sm">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          ) : (
          <div className="bg-white border border-kite-border rounded animate-fade-in overflow-hidden">
            <div className="p-3 md:p-4 border-b border-kite-border">
              <h3 className="text-sm font-medium text-kite-text">Current Investors</h3>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead>
                   <tr className="bg-kite-bg/50 text-[10px] tracking-wider text-kite-text-light uppercase border-b border-kite-border">
                     <th className="px-4 py-2 font-medium">Investor</th>
                     <th className="px-4 py-2 font-medium text-right">Amount</th>
                     <th className="px-4 py-2 font-medium text-right">Duration</th>
                     <th className="px-4 py-2 font-medium text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-kite-border">
                   {businessInvestments.map(inv => {
                     const investor = state.investors.find(i => i.id === inv.investorId);
                     return (
                       <tr key={inv.id} className="hover:bg-kite-bg transition-colors">
                         <td className="px-4 py-2.5 font-medium text-kite-text">{investor?.name || 'Unknown'}</td>
                         <td className="px-4 py-2.5 text-right font-medium text-kite-text">{formatINR(inv.amount)}</td>
                         <td className="px-4 py-2.5 text-right text-kite-text-light font-medium">{inv.timePeriodMonths}M</td>
                         <td className="px-4 py-2.5 text-center">
                           <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${inv.status === 'active' ? 'bg-kite-green/10 text-kite-green' : 'bg-kite-bg text-kite-text-light'}`}>
                             {inv.status}
                           </span>
                         </td>
                       </tr>
                     );
                   })}
                   {businessInvestments.length === 0 && (
                     <tr>
                       <td colSpan={4} className="p-6 text-center text-kite-text-light text-sm">No investors found.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="block md:hidden divide-y divide-kite-border">
              {businessInvestments.map(inv => {
                const investor = state.investors.find(i => i.id === inv.investorId);
                return (
                  <div key={inv.id} className="p-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-kite-text text-sm">{investor?.name || 'Unknown'}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${inv.status === 'active' ? 'bg-kite-green/10 text-kite-green' : 'bg-kite-bg text-kite-text-light'}`}>
                         {inv.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                       <span className="text-kite-text-light text-xs font-medium">{inv.timePeriodMonths} Months</span>
                       <span className="font-medium text-kite-text text-sm">{formatINR(inv.amount)}</span>
                    </div>
                  </div>
                );
              })}
              {businessInvestments.length === 0 && (
                 <div className="p-6 text-center text-kite-text-light text-sm">No investors found.</div>
              )}
            </div>

          </div>
          )}
        </div>

        {/* Right Column (Banking & Reg Details) */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Banking Profile */}
          <div className="bg-white border border-kite-border rounded p-4">
            <h3 className="text-xs font-medium text-kite-text-light uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Banking Profile</span>
            </h3>
            {business.bankDetails ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-kite-text-light uppercase tracking-wider mb-0.5">Bank Name</p>
                  <p className="font-medium text-kite-text text-sm">{business.bankDetails.bankName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-kite-text-light uppercase tracking-wider mb-0.5">Account Number</p>
                    <p className="font-mono text-kite-text text-sm tracking-wide">
                      {business.bankDetails.accountNumber.length > 4 
                        ? 'XXXXX' + business.bankDetails.accountNumber.slice(-4) 
                        : business.bankDetails.accountNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-kite-text-light uppercase tracking-wider mb-0.5">IFSC</p>
                    <p className="font-mono text-kite-text text-sm">{business.bankDetails.ifscCode}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-kite-border">
                  <p className="text-[10px] text-kite-text-light uppercase tracking-wider mb-0.5">Account Holder</p>
                  <p className="font-medium text-kite-text text-sm uppercase">{business.bankDetails.accountHolderName}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400">No bank details recorded.</p>
            )}
          </div>

          {/* Registration Details */}
          <div className="bg-kite-bg border border-kite-border rounded p-4">
            <h3 className="text-xs font-medium text-kite-text-light uppercase tracking-wider mb-3 border-b border-kite-border pb-2">Registration Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-kite-text-light font-medium">Date Registered</p>
                <p className="text-xs font-medium text-kite-text">{new Date(business.registrationDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-kite-text-light font-medium">Commission Paid</p>
                <p className="text-xs font-medium text-kite-text">{formatINR(business.registrationCommissionPaid)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-kite-text-light font-medium">Tax Collected</p>
                <p className="text-xs font-medium text-kite-text">{formatINR(business.taxPaid)}</p>
              </div>
              <div className="pt-3 border-t border-kite-border flex justify-between items-center">
                <p className="text-xs text-kite-text-light font-medium">Setup Revenue</p>
                <p className="text-sm font-medium text-kite-blue">{formatINR(business.registrationCommissionPaid + business.taxPaid)}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
