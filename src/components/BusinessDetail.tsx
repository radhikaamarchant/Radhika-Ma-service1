import { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { ArrowLeft, Building2, Save, X, Edit2, Shield, AlertCircle, BadgeCheck, Clock, Wallet, ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import { Business } from '../types';
import { getVerificationStats } from '../utils/blueTick';

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
  });

  const [isEnhancedEditing, setIsEnhancedEditing] = useState(false);
  const [enhancedFormData, setEnhancedFormData] = useState({
    name: business?.name || '',
    description: business?.description || '',
    location: business?.location || '',
    photoUrl: business?.photoUrl || '',
  });

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
      }
    });
    setIsEditing(false);
  };

  const handleEnhancedSave = () => {
    dispatch({
      type: 'UPDATE_BUSINESS',
      payload: {
        ...business,
        name: enhancedFormData.name,
        description: enhancedFormData.description,
        location: enhancedFormData.location,
        photoUrl: enhancedFormData.photoUrl,
      }
    });
    setIsEnhancedEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fundingRequired: business.fundingRequired.toString(),
      interestRate: business.interestRate.toString(),
      status: business.status,
    });
    setIsEditing(false);
  };

  const handleEnhancedCancel = () => {
    setEnhancedFormData({
      name: business.name || '',
      description: business.description || '',
      location: business.location || '',
      photoUrl: business.photoUrl || '',
    });
    setIsEnhancedEditing(false);
  };

  const bankTransactions: { id: string, type: 'CREDIT' | 'DEBIT', amount: number, date: Date, title: string, description: string }[] = [];
  let liveBalance = 0;

  businessInvestments.forEach(inv => {
    const investor = state.investors.find(i => i.id === inv.investorId);
    bankTransactions.push({
      id: `credit-${inv.id}`,
      type: 'CREDIT',
      amount: inv.amount,
      date: new Date(inv.startDate),
      title: 'Investment Received',
      description: `From ${investor?.name || 'Unknown'} (#${investor?.investorId || 'N/A'})`
    });
    liveBalance += inv.amount;

    if (inv.status === 'completed' && inv.payoutDetails) {
      const p = inv.payoutDetails;
      
      const rmasCover = p.rmasMarketCover || 0;
      const rmasSubsidy = p.rmasSubsidyPays || 0;
      
      if (rmasSubsidy > 0) {
        bankTransactions.push({
          id: `credit-subsidy-${inv.id}`,
          type: 'CREDIT',
          amount: rmasSubsidy,
          date: new Date(p.payoutDate),
          title: 'RMAS Subsidy Credit',
          description: 'Authority funding/aid from RMAS'
        });
        liveBalance += rmasSubsidy;
      }
      
      if (rmasCover > 0) {
        bankTransactions.push({
          id: `credit-cover-${inv.id}`,
          type: 'CREDIT',
          amount: rmasCover,
          date: new Date(p.payoutDate),
          title: 'RMAS Loss Protection Credit',
          description: 'Principal & interest shortfall cover by RMAS'
        });
        liveBalance += rmasCover;
      }

      const grossPayout = p.totalCredited + p.rmasCommission + p.happyIncomeTax;
      bankTransactions.push({
        id: `debit-${inv.id}`,
        type: 'DEBIT',
        amount: grossPayout,
        date: new Date(p.payoutDate),
        title: 'Settlement Paid',
        description: `To ${investor?.name || 'Unknown'}`
      });
      liveBalance -= grossPayout;
    }
  });

  bankTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-fade-in transition-all">
      <div className="flex items-center space-x-4 mb-4 md:mb-8">
        <button onClick={onBack}
          className="p-2 hover:bg-kite-border rounded-full transition-colors"
        >
          <ArrowLeft  className="w-4 h-4 md:w-5 md:h-5 text-kite-text" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <p className="hidden md:block text-sm text-kite-text-light mt-1">Detailed View & Configuration</p>
          <h3 className={"flex md:hidden font-medium items-center space-x-1.5 " + (business.name.length > 20 ? 'text-[11px]' : 'text-sm') + " text-kite-text"}>
            <span className="truncate max-w-[200px]">{business.name}</span>
            {isBlueTick && <BadgeCheck  className="w-4 h-4 text-white fill-blue-500 shrink-0" />}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full bg-white border border-kite-border rounded-sm p-4">
            <div className="flex justify-center md:justify-between items-center border-b border-kite-border pb-4 mb-4">
              <h3 className={"hidden md:flex font-medium items-center space-x-2 text-base text-kite-text"}>
                <span className="truncate max-w-xs">{business.name}</span>
                {isBlueTick && <BadgeCheck  className="w-5 h-5 text-white fill-blue-500 shrink-0" title="RMAS Verified" />}
              </h3>
              {!isEditing ? (
                <div className="flex items-center space-x-3 md:space-x-2 w-full md:w-auto justify-center">
                  <button onClick={() => setViewMode(viewMode === 'bank' ? 'details' : 'bank')}
                    className={"flex-1 md:flex-none justify-center flex items-center space-x-1 text-sm font-medium border px-4 md:px-3 py-2 md:py-1.5 rounded-sm transition-colors " + (viewMode === 'bank' ? 'bg-kite-blue/10 text-kite-blue border-kite-blue/30' : 'text-kite-text-light hover:text-kite-text border-kite-border bg-white hover:bg-kite-bg')}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{viewMode === 'bank' ? 'Details' : 'Bank Balance'}</span>
                  </button>
                  <button onClick={() => setIsEditing(true)}
                    className="flex-1 md:flex-none justify-center flex items-center space-x-1 text-sm font-medium text-kite-text-light hover:text-kite-text border border-kite-border px-4 md:px-3 py-2 md:py-1.5 rounded-sm bg-white hover:bg-kite-bg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Your Profile</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button onClick={handleCancel}
                    className="flex items-center space-x-1 text-sm font-medium text-kite-text-light hover:text-kite-text transition-colors"
                  >
                    <X className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button onClick={handleSave}
                    className="flex items-center space-x-1 text-sm font-medium text-white bg-black hover:bg-slate-800 px-3 py-1.5 rounded-sm transition-colors"
                  >
                    <Save className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            
            {viewMode === 'bank' ? (
              <div className="w-full animate-fade-in min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-4 border-l-4 border-kite-blue bg-kite-bg/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-kite-text-light mb-3 flex items-center space-x-1">
                       <Building2 className="w-3 h-3" />
                       <span>Registered Bank Details</span>
                    </h4>
                    {business.bankDetails ? (
                      <div className="space-y-1 mt-2">
                        <p className="font-semibold text-kite-text text-sm">{business.bankDetails.bankName}</p>
                        <p className="font-mono text-kite-text-light text-sm tracking-widest">{business.bankDetails.accountNumber}</p>
                        <p className="font-mono text-kite-text-light text-sm">IFSC: {business.bankDetails.ifscCode}</p>
                        <p className="text-xs uppercase font-medium text-kite-text-light mt-2 pt-2 border-t border-kite-border">{business.bankDetails.accountHolderName}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-kite-text-light">No bank connected yet.</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center items-start md:items-end p-4">
                    <p className="text-xs text-kite-text-light mb-1">Available balance</p>
                    <p className={"text-2xl md:text-3xl font-medium tracking-tight " + (liveBalance >= 0 ? "text-kite-blue" : "text-kite-red")} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {liveBalance >= 0 ? '' : '-'}{formatINR(Math.abs(liveBalance))}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-xl font-medium text-kite-text mb-4">
                    Statement
                  </h4>
                  {bankTransactions.length > 0 ? (
                    <div className="overflow-x-auto border border-kite-border/50 rounded-sm">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-kite-bg">
                          <tr className="text-[10px] uppercase tracking-wider text-kite-text-light border-b border-kite-border/50">
                            <th className="py-2.5 px-4 font-normal">Date</th>
                            <th className="py-2.5 px-4 font-normal">Particulars</th>
                            <th className="py-2.5 px-4 text-right font-normal">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-kite-border/50 bg-white">
                          {bankTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-kite-bg/30 transition-colors">
                              <td className="py-3 px-4 text-xs text-kite-text-light">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-kite-text">{tx.title}</p>
                                <p className="text-[11px] text-kite-text-light mt-0.5">{tx.description}</p>
                              </td>
                              <td className={"py-3 px-4 text-right text-sm " + (tx.type === 'CREDIT' ? 'text-kite-green' : 'text-kite-text')} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                {tx.type === 'CREDIT' ? '' : '-'}{formatINR(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-kite-text-light text-sm border border-kite-border/50 rounded-sm">
                      No transactions recorded yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex justify-between items-end md:items-start md:flex-col md:justify-start">
                <div>
                  <label className="block text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-wider mb-1 md:mb-2">Funding Required (₹)</label>
                  {isEditing ? (
                    <input type="number" className="w-full border border-kite-border rounded-sm p-2.5 font-medium text-kite-text focus:ring-2 focus:ring-black outline-none" value={formData.fundingRequired} onChange={e => setFormData({...formData, fundingRequired: e.target.value})} />
                  ) : (
                    <p className="text-sm md:text-base font-medium text-kite-text">{formatINR(business.fundingRequired)}</p>
                  )}
                </div>
                <div className="md:hidden">
                   {isEditing ? (
                      <input type="number" step="0.1" className="w-16 border border-kite-border rounded-sm p-1 font-medium text-kite-text text-sm focus:ring-2 focus:ring-black outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} />
                   ) : (
                      <p className="text-sm font-medium text-kite-green">{business.interestRate}%</p>
                   )}
                </div>
              </div>

              <div className="hidden md:block">
                <label className="block text-xs font-medium text-kite-text-light uppercase tracking-wider mb-2">Interest Rate (%)</label>
                {isEditing ? (
                  <input type="number" step="0.1" className="w-full border border-kite-border rounded-sm p-2.5 font-medium text-kite-text focus:ring-2 focus:ring-black outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} />
                ) : (
                  <p className="text-base font-medium text-kite-green">{business.interestRate}%</p>
                )}
              </div>

              <div className="mt-2 md:mt-0 pt-3 border-t border-kite-border/50 md:border-0 md:pt-0 flex justify-between items-center md:items-start md:flex-col md:justify-start">
                <label className="block text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-wider mb-0 md:mb-2">Status</label>
                {isEditing ? (
                  <select className="w-auto md:w-full border border-kite-border rounded-sm p-1 md:p-2.5 text-xs md:text-sm font-medium text-kite-text focus:ring-2 focus:ring-black outline-none bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="pending">Pending</option>
                    <option value="listed">Listed</option>
                    <option value="funded">Funded</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs md:text-sm font-medium capitalize ${business.status === 'listed' ? 'bg-kite-green/10 text-green-800' : business.status === 'funded' ? 'bg-black text-white' : 'bg-gray-100 text-kite-text'}`}>
                    {business.status}
                  </span>
                )}
              </div>
              <div className="mt-2 md:mt-0 pt-3 border-t border-kite-border/50 md:border-0 md:pt-0 flex flex-col items-start md:justify-start">
                <label className="block text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-wider mb-1 md:mb-2">Owner</label>
                <div className="flex md:flex-col items-baseline justify-between w-full">
                  <p className="text-sm md:text-base font-medium text-kite-text truncate">{business.ownerName}</p>
                  {business.authorityType && (
                    <p className="hidden md:block text-sm font-medium text-kite-text-light mt-1">
                      {business.authorityType}
                      {business.rmasSubsidy ? ` (${business.rmasSubsidy}% Subsidy)` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <>
                <div className="mt-3 md:mt-6 p-2 md:p-4 bg-kite-red/10 border border-kite-red/30 rounded-sm flex items-start space-x-3 text-red-800">
                  <AlertCircle  className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Changing parameters only applies to future entries.</p>
                </div>
                
                <div className="mt-6 border-t border-kite-border pt-4">
                  <p className="text-sm font-medium text-kite-text-light uppercase tracking-wide mb-3">Banking Profile</p>
                  {business.bankDetails ? (
                    <div className="bg-kite-bg p-3 rounded-sm border border-kite-border text-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium text-kite-text">{business.bankDetails.bankName}</p>
                        <p className="font-mono text-kite-text-light mt-1">A/C: {business.bankDetails.accountNumber}</p>
                        <p className="font-mono text-kite-text-light mt-0.5">IFSC: {business.bankDetails.ifscCode}</p>
                        <p className="text-xs font-medium text-kite-text-light mt-2 uppercase">HOLDER: {business.bankDetails.accountHolderName}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-2 text-kite-text-light font-medium">Not Provided</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-kite-border flex justify-end">
                  {onDelete && (
                    <button onClick={() => { onDelete(); }} className="bg-kite-red/10 text-kite-red border border-kite-red/30 hover:bg-kite-red/20 font-medium text-sm px-4 py-2 rounded-sm transition-colors">
                      Delete Profile
                    </button>
                  )}
                </div>
              </>
            )}
            </>
           )}
          </div>

          {isPreVerified && vStats && (
            <div className="bg-white border border-kite-border rounded-sm p-2 md:p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock  className="w-4 h-4 md:w-5 md:h-5 text-black" />
                <h3 className="text-xs md:text-base font-medium text-kite-text">Verification Coming Soon: Indian Trusted & Largest Economy Business Record</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-kite-text">
                  <span>Current Profit: {vStats.profitPctDisplay.toFixed(1)}%</span>
                  <span>Goal: 60%</span>
                </div>
                <div className="w-full bg-kite-bg rounded-full h-2.5">
                  <div className="bg-black h-2.5 rounded-full transition-all duration-500" style={{ width: `${vStats.progressToBlueTick * 100}%` }}></div>
                </div>
                <p className="text-xs text-black mt-2">
                  Reach 60% profit delivery to investors and 20 unique investors to unlock the permanent RMAS Blue Tick and Enhanced Profile Support.
                </p>
              </div>
            </div>
          )}

          {isBlueTick && (
            <div className="bg-kite-blue/10 border border-kite-blue/30 rounded-sm p-2 md:p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 pointer-events-none">
                <BadgeCheck  className="w-16 h-16 md:w-32 md:h-32 fill-blue-500 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-center border-b border-kite-blue/30 pb-4 mb-4">
                  <h3 className="text-xs md:text-base font-medium text-blue-900 flex items-center space-x-2">
                    <BadgeCheck  className="w-4 h-4 md:w-5 md:h-5 text-white fill-blue-500" />
                    <span>Enhanced Support: Profile Editor</span>
                  </h3>
                  {!isEnhancedEditing ? (
                    <button onClick={() => setIsEnhancedEditing(true)}
                      className="flex items-center space-x-1 text-sm font-medium text-kite-blue hover:text-blue-900 border border-blue-300 px-3 py-1.5 rounded-sm bg-white hover:bg-kite-blue/10 transition-colors"
                    >
                      <Edit2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button onClick={handleEnhancedCancel}
                        className="flex items-center space-x-1 text-sm font-medium text-kite-blue hover:text-blue-800 transition-colors"
                      >
                        <X className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        <span>Cancel</span>
                      </button>
                      <button onClick={handleEnhancedSave}
                        className="flex items-center space-x-1 text-sm font-medium text-white bg-kite-blue hover:bg-kite-blue px-3 py-1.5 rounded-sm transition-colors"
                      >
                        <Save className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        <span>Sync Changes</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-blue-800 uppercase tracking-wider mb-2">Display Name</label>
                    {isEnhancedEditing ? (
                      <input type="text" className="w-full border border-kite-blue/30 rounded-sm p-2.5 font-medium text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={enhancedFormData.name} onChange={e => setEnhancedFormData({...enhancedFormData, name: e.target.value})} />
                    ) : (
                      <p className="text-xs md:text-base font-medium text-black">{business.name}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-blue-800 uppercase tracking-wider mb-2">Description</label>
                    {isEnhancedEditing ? (
                      <textarea className="w-full border border-kite-blue/30 rounded-sm p-2.5 font-medium text-kite-text focus:ring-2 focus:ring-blue-500 outline-none bg-white min-h-[80px]" value={enhancedFormData.description} onChange={e => setEnhancedFormData({...enhancedFormData, description: e.target.value})} placeholder="Verified business description..." />
                    ) : (
                      <p className="text-sm font-medium text-kite-text whitespace-pre-wrap">{business.description || 'No description provided.'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-800 uppercase tracking-wider mb-2">Location</label>
                    {isEnhancedEditing ? (
                      <input type="text" className="w-full border border-kite-blue/30 rounded-sm p-2.5 font-medium text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={enhancedFormData.location} onChange={e => setEnhancedFormData({...enhancedFormData, location: e.target.value})} placeholder="City, State" />
                    ) : (
                      <p className="text-base font-medium text-black">{business.location || 'Not Specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-800 uppercase tracking-wider mb-2">Photo URL</label>
                    {isEnhancedEditing ? (
                      <input type="text" className="w-full border border-kite-blue/30 rounded-sm p-2.5 font-medium text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={enhancedFormData.photoUrl} onChange={e => setEnhancedFormData({...enhancedFormData, photoUrl: e.target.value})} placeholder="https://..." />
                    ) : (
                      <p className="text-sm font-medium text-blue-600 break-all">{business.photoUrl || 'No Photo URL'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode !== 'bank' && (
          <div className="bg-white border border-kite-border rounded-sm p-2 md:p-4 mt-6">
            <h3 className="text-xs md:text-base font-medium text-kite-text flex justify-between items-center mb-4">
              <span>Current Investors</span>
              <span className="text-sm font-semibold text-kite-blue">Total Funded: {formatINR(businessInvestments.reduce((sum, inv) => sum + inv.amount, 0))}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-kite-bg border-b border-kite-border text-[10px] uppercase tracking-wider text-kite-text-light">
                  <tr>
                    <th className="p-2 md:p-4 font-medium">Investor</th>
                    <th className="p-2 md:p-4 font-medium text-right md:text-left">Invested</th>
                    <th className="hidden md:table-cell p-2 md:p-4 font-medium">Interest</th>
                    <th className="p-2 md:p-4 font-medium text-right md:text-left">Period</th>
                    <th className="p-2 md:p-4 font-medium text-center md:text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                {businessInvestments.map(inv => {
                  const investor = state.investors.find(i => i.id === inv.investorId);
                  return (
                    <tr key={inv.id} className="border-b border-kite-border hover:bg-kite-bg">
                      <td className="p-2 md:p-4 font-medium text-kite-text truncate max-w-[120px] text-xs md:text-sm">{investor?.name}</td>
                      <td className="p-2 md:p-4 font-medium text-kite-text text-right md:text-left text-xs md:text-sm">{formatINR(inv.amount)}</td>
                      <td className="hidden md:table-cell p-2 md:p-4 font-medium text-kite-green">{inv.interestRate}%</td>
                      <td className="p-2 md:p-4 text-kite-text-light font-medium text-right md:text-left text-xs md:text-sm">{inv.timePeriodMonths}M</td>
                      <td className="p-2 md:p-4 text-center md:text-left">
                        <span className="hidden md:inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-kite-green/20 text-kite-text">
                          {inv.status.toUpperCase()}
                        </span>
                        <span className="md:hidden inline-flex items-center justify-center">
                           <span className={`w-2.5 h-2.5 rounded-full ${inv.status.toLowerCase() === 'active' ? 'bg-kite-green' : 'bg-kite-blue'}`}></span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {businessInvestments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-kite-text-light font-medium">No investors have funded this business yet.</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-kite-bg border border-kite-border rounded-sm p-2 md:p-4">
            <h3 className="text-sm font-medium text-kite-text-light uppercase tracking-wider mb-4 border-b border-kite-border pb-2">Registration Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-kite-text-light font-medium">Date Registered</p>
                <p className="text-sm font-medium text-kite-text mt-1">{new Date(business.registrationDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-kite-text-light font-medium">Reg. Commission Paid</p>
                <p className="text-sm font-medium text-kite-text mt-1">{formatINR(business.registrationCommissionPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-kite-text-light font-medium">Tax Collected</p>
                <p className="text-sm font-medium text-kite-text mt-1">{formatINR(business.taxPaid)}</p>
              </div>
              <div className="pt-4 border-t border-kite-border">
                <p className="text-xs text-kite-text-light font-medium">Total Setup Revenue</p>
                <p className="text-xs md:text-base font-medium text-kite-red mt-1">{formatINR(business.registrationCommissionPaid + business.taxPaid)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
