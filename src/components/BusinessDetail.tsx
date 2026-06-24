import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { ArrowLeft, Building2, Save, X, Edit2, Shield, AlertCircle, BadgeCheck, Clock, Wallet, ArrowDownRight, ArrowUpRight, FileText, ImageIcon, Upload } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Business } from '../types';
import { getVerificationStats } from '../utils/blueTick';
import { getUnifiedBankBalance, getUnifiedTransactions } from '../utils/bankBalance';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // @ts-ignore
    canvas.width = croppedAreaPixels.width;
    // @ts-ignore
    canvas.height = croppedAreaPixels.height;

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
      // @ts-ignore
      croppedAreaPixels.width,
      // @ts-ignore
      croppedAreaPixels.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    setFormData({ ...formData, photoUrl: base64Image });
    setImageSrc(null);
  };

  const unifiedBalance = business ? getUnifiedBankBalance(business.ownerName, state.businesses, state.investors, state.investments) : 0;
  
  const bankTransactions = business ? getUnifiedTransactions(business.ownerName, state.businesses, state.investors, state.investments) : [];

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
            {business.id === 'admin_business' && (
              <span className="bg-blue-100 text-blue-800 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-wider">
                Owned
              </span>
            )}
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
                {business.id === 'admin_business' && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified & Owned
                  </span>
                )}
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
                    <p className={"text-2xl md:text-3xl font-medium tracking-tight " + (unifiedBalance >= 0 ? "text-kite-blue" : "text-kite-red")} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {unifiedBalance >= 0 ? '' : '-'}{formatINR(Math.abs(unifiedBalance))}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-medium text-kite-text">Statement</h4>
                    <select 
                      className="border border-kite-border rounded-sm px-2 py-1 text-sm bg-white outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        const rows = document.querySelectorAll('.tx-row');
                        rows.forEach(row => {
                          if (val === 'all') row.classList.remove('hidden');
                          else if (row.getAttribute('data-category') === val) row.classList.remove('hidden');
                          else row.classList.add('hidden');
                        });
                      }}
                    >
                      <option value="all">All Transactions</option>
                      <option value="commission">Commission</option>
                      <option value="sahay">Sahay</option>
                    </select>
                  </div>
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
                            <tr key={tx.id} className="hover:bg-kite-bg/30 transition-colors tx-row" data-category={tx.category || 'other'}>
                              <td className="py-3 px-4 text-xs text-kite-text-light">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-kite-text flex items-center space-x-2">
                                  <span>{tx.title}</span>
                                  {tx.category === 'commission' && <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[9px] uppercase tracking-wider">Commission</span>}
                                  {tx.category === 'sahay' && <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 text-[9px] uppercase tracking-wider">Sahay</span>}
                                </p>
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
            ) : isEditing ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-kite-border bg-kite-bg flex flex-col items-center justify-center relative group">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-center">No Photo</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Business Name</label>
                    <input type="text" className="w-full border-b border-gray-200 p-2 text-base font-medium focus:border-kite-blue outline-none transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Business Name" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Description</label>
                    <textarea className="w-full border-b border-gray-200 p-2 text-sm focus:border-kite-blue outline-none transition-colors resize-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="About the business..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Location</label>
                    <input type="text" className="w-full border-b border-gray-200 p-2 text-sm font-medium focus:border-kite-blue outline-none transition-colors" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City, State" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status</label>
                    <select className="w-full border-b border-gray-200 p-2 text-sm font-medium focus:border-kite-blue outline-none transition-colors bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="pending">Pending</option>
                      <option value="listed">Listed</option>
                      <option value="funded">Funded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Funding Required (₹)</label>
                    <input type="number" className="w-full border-b border-gray-200 p-2 text-sm font-medium focus:border-kite-blue outline-none transition-colors" value={formData.fundingRequired} onChange={e => setFormData({...formData, fundingRequired: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Interest Rate (%)</label>
                    <input type="number" step="0.1" className="w-full border-b border-gray-200 p-2 text-sm font-medium focus:border-kite-blue outline-none transition-colors" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} />
                  </div>
                </div>

                <div className="mt-8 border-t border-kite-border pt-4">
                  <div className="p-3 bg-kite-red/5 border border-kite-red/20 rounded-sm flex items-start space-x-3 text-red-800 mb-6">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm font-medium">Changing financial parameters only applies to future entries.</p>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    {onDelete && (
                      <button onClick={() => { onDelete(); }} className="bg-white text-kite-red border border-kite-red/30 hover:bg-kite-red/5 font-medium text-xs md:text-sm px-4 py-2 rounded-sm transition-colors">
                        Delete Business
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex justify-between items-end md:items-start md:flex-col md:justify-start">
                    <div>
                      <label className="block text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-wider mb-1 md:mb-2">Funding Required (₹)</label>
                      <p className="text-sm md:text-base font-medium text-kite-text">{formatINR(business.fundingRequired)}</p>
                    </div>
                    <div className="md:hidden">
                      <p className="text-sm font-medium text-kite-green">{business.interestRate}%</p>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <label className="block text-xs font-medium text-kite-text-light uppercase tracking-wider mb-2">Interest Rate (%)</label>
                    <p className="text-base font-medium text-kite-green">{business.interestRate}%</p>
                  </div>

                  <div className="mt-2 md:mt-0 pt-3 border-t border-kite-border/50 md:border-0 md:pt-0 flex justify-between items-center md:items-start md:flex-col md:justify-start">
                    <label className="block text-[10px] md:text-xs font-medium text-kite-text-light uppercase tracking-wider mb-0 md:mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs md:text-sm font-medium capitalize ${business.status === 'listed' ? 'bg-kite-green/10 text-green-800' : business.status === 'funded' ? 'bg-black text-white' : 'bg-gray-100 text-kite-text'}`}>
                      {business.status}
                    </span>
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
              </div>
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

      {/* Image Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-semibold text-lg">Crop & Adjust Profile Picture</h3>
              <button onClick={() => setImageSrc(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
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
            
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setImageSrc(null)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createCroppedImage}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-sm shadow-sm"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
