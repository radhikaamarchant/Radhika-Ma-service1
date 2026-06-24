import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Upload, Image as ImageIcon, BadgeCheck, X, Building2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useAppContext } from '../utils/AppContext';
import { getUnifiedBankBalance, getUnifiedTransactions } from '../utils/bankBalance';
import { sanitizeDatabase } from '../utils/dataSanitizer';
import { formatINR } from '../utils/mockData';
import SettingsModal from '../components/SettingsModal';

interface AdminProfile {
  name: string;
  address: string;
  photoUrl: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
}

export default function AdminPage() {
  const { state, dispatch } = useAppContext();
  
  const [profile, setProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('adminProfile');
    return saved ? JSON.parse(saved) : { name: 'Radhika Merchant', address: '', photoUrl: '' };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    if (state.loading) return;
    
    const adminBizId = 'admin_business';
    const adminInvId = 'admin_investor';
    
    if (!state.businesses.find(b => b.id === adminBizId) || !state.investors.find(i => i.id === adminInvId)) {
      handleSave();
    }
  }, [state.loading, state.businesses.length, state.investors.length]);

  const handleSave = async () => {
    localStorage.setItem('adminProfile', JSON.stringify(formData));
    setProfile(formData);
    setIsEditing(false);
    window.dispatchEvent(new Event('adminProfileUpdated'));
    
    // Sync to Business and Investor
    const adminBizId = 'admin_business';
    const adminInvId = 'admin_investor';
    const uniqueId = 'RMAS-ADMIN-1';
    const adminName = 'Radhika Merchant';
    
    const existingBiz = state.businesses.find(b => b.id === adminBizId);
    const businessPayload: any = {
      id: adminBizId,
      businessId: uniqueId,
      name: `My ${adminName} Private Limited`,
      ownerName: adminName,
      registrationDate: new Date().toISOString(),
      fundingRequired: 0,
      interestRate: 0,
      registrationCommissionPaid: 0,
      taxPaid: 0,
      status: 'listed',
      ...existingBiz
    };
    // Ensure overrides
    businessPayload.name = `My ${adminName} Private Limited`;
    businessPayload.ownerName = adminName;
    businessPayload.businessId = uniqueId;

    const existingInv = state.investors.find(i => i.id === adminInvId);
    const investorPayload: any = {
      id: adminInvId,
      investorId: uniqueId,
      name: adminName,
      joinDate: new Date().toISOString(),
      totalInvested: 0,
      rmasServiceCharge: 0,
      bankDetails: {
        bankName: formData.bankName || 'Unknown Bank',
        accountNumber: formData.accountNumber || '',
        ifscCode: formData.ifscCode || '',
        accountHolderName: adminName
      },
      ...existingInv
    };
    investorPayload.name = adminName;
    investorPayload.investorId = uniqueId;
    if (formData.bankName) investorPayload.bankDetails.bankName = formData.bankName;
    if (formData.accountNumber) investorPayload.bankDetails.accountNumber = formData.accountNumber;
    if (formData.ifscCode) investorPayload.bankDetails.ifscCode = formData.ifscCode;

    await dispatch({ type: existingBiz ? 'UPDATE_BUSINESS' : 'ADD_BUSINESS', payload: businessPayload });
    await dispatch({ type: existingInv ? 'UPDATE_INVESTOR' : 'ADD_INVESTOR', payload: investorPayload });
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
      targetHeight
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.7);
    setFormData({ ...formData, photoUrl: base64Image });
    setImageSrc(null);
  };

  const unifiedBalance = getUnifiedBankBalance('Radhika M', state.businesses, state.investors, state.investments);
  const bankTransactions = getUnifiedTransactions('Radhika M', state.businesses, state.investors, state.investments);

  return (
    <div className="flex-1 bg-kite-bg h-full p-4 md:p-8 overflow-y-auto animate-fade-in relative font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-end mb-8 border-b border-kite-border pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-kite-text">I'm Radhika</h2>
            <p className="text-sm text-kite-text-light mt-1">Admin Profile Settings</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-100 text-kite-text px-5 py-2 rounded-sm text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm"
                >
                  General
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-kite-blue text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-kite-blue/90 transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-sm border border-kite-border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Photo Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex flex-col items-center justify-center relative group">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">No Photo</span>
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-6 w-full">
              {isEditing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Admin Name</label>
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-200 p-2 text-lg font-medium focus:border-kite-blue outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Admin Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Office / Home Address</label>
                      <textarea
                        className="w-full border-b-2 border-gray-200 p-2 text-base focus:border-kite-blue outline-none transition-colors resize-none h-24"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address..."
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-kite-text tracking-tight mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" /> Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bank Name</label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-200 p-2 text-base font-medium focus:border-kite-blue outline-none transition-colors"
                          value={formData.bankName || ''}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="e.g. HDFC Bank"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Account Number</label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-200 p-2 text-base font-medium focus:border-kite-blue outline-none transition-colors"
                          value={formData.accountNumber || ''}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="e.g. 50100XXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">IFSC Code</label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-200 p-2 text-base font-medium focus:border-kite-blue outline-none transition-colors uppercase"
                          value={formData.ifscCode || ''}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                          placeholder="e.g. HDFC0001234"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Branch</label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-200 p-2 text-base font-medium focus:border-kite-blue outline-none transition-colors"
                          value={formData.branch || ''}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          placeholder="e.g. Navrangpura"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-6 border-t border-kite-border">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-kite-blue hover:bg-kite-blue/90 text-white px-5 py-2.5 rounded-sm text-sm font-medium transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormData(profile);
                        setIsEditing(false);
                      }}
                      className="flex items-center space-x-2 bg-white border border-kite-border hover:bg-gray-50 text-kite-text px-5 py-2.5 rounded-sm text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Admin Name</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-kite-text tracking-tight">{profile.name}</p>
                      <BadgeCheck className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Office / Home Address</h3>
                    {profile.address ? (
                      <p className="text-base text-kite-text whitespace-pre-wrap leading-relaxed">{profile.address}</p>
                    ) : (
                      <p className="text-sm text-kite-text-light italic">No address provided.</p>
                    )}
                  </div>
                  
                  {profile.bankName && (
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-kite-text tracking-tight mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" /> Bank Account</h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50 rounded-sm p-4 border border-gray-100">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Bank Name</p>
                          <p className="text-sm font-medium text-kite-text">{profile.bankName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Account Number</p>
                          <p className="text-sm font-mono text-kite-text">{profile.accountNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">IFSC Code</p>
                          <p className="text-sm font-mono text-kite-text">{profile.ifscCode || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Branch</p>
                          <p className="text-sm font-medium text-kite-text">{profile.branch || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Admin Unified Statement */}
        {!isEditing && (
          <div className="bg-white rounded-sm border border-kite-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-kite-text tracking-tight">Financial Statement</h3>
              <div className="text-right">
                <p className="text-xs text-kite-text-light mb-1">Available balance</p>
                <p className={"text-2xl font-medium tracking-tight " + (unifiedBalance >= 0 ? "text-kite-blue" : "text-kite-red")} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  {unifiedBalance >= 0 ? '' : '-'}{formatINR(Math.abs(unifiedBalance))}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-kite-text">Transactions</h4>
              <select 
                className="border border-kite-border rounded-sm px-2 py-1 text-sm bg-white outline-none"
                onChange={(e) => {
                  const val = e.target.value;
                  const rows = document.querySelectorAll('.admin-tx-row');
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
                <option value="cover">Loss Cover</option>
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
                      <tr key={tx.id} className="hover:bg-kite-bg/30 transition-colors admin-tx-row" data-category={tx.category || 'other'}>
                        <td className="py-3 px-4 text-xs text-kite-text-light">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-kite-text flex items-center space-x-2">
                            <span>{tx.title}</span>
                            {tx.category === 'commission' && <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[9px] uppercase tracking-wider">Commission</span>}
                            {tx.category === 'sahay' && <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 text-[9px] uppercase tracking-wider">Sahay</span>}
                            {tx.category === 'cover' && <span className="px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-700 text-[9px] uppercase tracking-wider">Cover</span>}
                          </p>
                          <p className="text-[11px] text-kite-text-light mt-0.5">{tx.description}</p>
                        </td>
                        <td className={"py-3 px-4 text-right text-sm " + (tx.type === 'CREDIT' ? 'text-kite-green' : 'text-kite-text')} style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          {tx.type === 'CREDIT' ? '+' : '-'}{formatINR(tx.amount)}
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
        )}
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {/* Image Cropper Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
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
