import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { Plus, Search, Building2, Banknote, Building, FileText, Download, X, BadgeCheck, ChevronDown } from 'lucide-react';
import { Business } from '../types';
import BusinessDetail from '../components/BusinessDetail';
import { INDIAN_BANKS } from '../utils/indianBanks';
import { downloadElementAsPDF } from '../utils/pdfGenerator';
import { getBlueTickBusinessIds } from '../utils/blueTick';

export default function Businesses() {
  const { state, dispatch } = useAppContext();
  
  const [viewMode, setViewMode] = useState<'list' | 'add-step-1' | 'add-step-2'>('list');
  const [ownerMode, setOwnerMode] = useState<'new' | 'existing'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');

  // PDF Modal State
  const [pdfBusiness, setPdfBusiness] = useState<Business | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    ownerName: '',
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

  const filteredBusinesses = state.businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.businessId?.includes(searchTerm)
  ).sort((a, b) => getTime(b.id) - getTime(a.id));

  const blueTickBusinessIds = getBlueTickBusinessIds(state.businesses, state.investments);
  const isBlueTick = (bizId: string) => blueTickBusinessIds.has(bizId);

  const uniqueOwners = Array.from(new Set(state.businesses.map(b => b.businessId))).map(id => state.businesses.find(b => b.businessId === id)!);

  const handleExistingOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOwnerId = e.target.value;
    const ownerRecord = state.businesses.find(b => b.businessId === selectedOwnerId);
    if (ownerRecord) {
      setFormData({
        ...formData,
        businessId: ownerRecord.businessId,
        ownerName: ownerRecord.ownerName,
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

  const handlePrintPdf = () => {
    downloadElementAsPDF('business-pdf-content', `Business_Terms_${pdfBusiness?.name || 'Document'}`);
  };

  if (selectedBusinessId) {
    return <BusinessDetail businessId={selectedBusinessId} onBack={() => setSelectedBusinessId(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:m-0 print:p-0">
      
      <div className="print:hidden space-y-6">
        {viewMode === 'list' && (
          <>
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">Businesses</h2>
                <p className="text-sm text-gray-500 mt-1">Manage registered businesses needing funding.</p>
              </div>
              <button 
                onClick={startAddBusiness}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <Plus size={18} />
                <span>Register Business</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search businesses by name, owner, or ID..." 
                  className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="p-4 font-semibold text-gray-900">ID Number</th>
                      <th className="p-4 font-semibold text-gray-900">Business Name</th>
                      <th className="p-4 font-semibold text-gray-900">Owner</th>
                      <th className="p-4 font-semibold text-gray-900">Bank Details</th>
                      <th className="p-4 font-semibold text-gray-900">Funding Needed</th>
                      <th className="p-4 font-semibold text-gray-900">Interest</th>
                      <th className="p-4 font-semibold text-gray-900 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.map(business => (
                      <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-mono text-gray-600 font-medium">#{business.businessId}</td>
                        <td className="p-4 font-bold text-black flex items-center space-x-1.5 h-full">
                          <span>{business.name}</span>
                          {isBlueTick(business.id) && <BadgeCheck size={16} className="text-white fill-blue-500 flex-shrink-0" title="RMAS Verified - High Profit" />}
                        </td>
                        <td className="p-4 text-gray-600">{business.ownerName}</td>
                        <td className="p-4 text-xs text-gray-500">
                          {business.bankDetails ? (
                            <div>
                              <div className="font-semibold text-gray-800">{business.bankDetails.bankName}</div>
                              <div>A/C: {business.bankDetails.accountNumber}</div>
                            </div>
                          ) : 'Not Provided'}
                        </td>
                        <td className="p-4 font-semibold text-black">{formatINR(business.fundingRequired)}</td>
                        <td className="p-4 text-green-600 font-bold">{business.interestRate}%</td>
                        <td className="p-4 text-center space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedBusinessId(business.id)}
                            className="text-gray-500 hover:text-black font-semibold text-xs px-3 py-1.5 border border-gray-200 rounded-lg transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => setPdfBusiness(business)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-lg inline-flex items-center space-x-1"
                          >
                            <FileText size={14} />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'DELETE_BUSINESS', payload: business.id });
                            }}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredBusinesses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">No businesses found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewMode === 'add-step-1' && (
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center space-x-2">
              <Building2 size={22} className="text-gray-800" />
              <span>Step 1: Business Profile</span>
            </h3>

            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setOwnerMode('new');
                  setFormData({ ...formData, businessId: generateBusinessId(), ownerName: '', bankName: INDIAN_BANKS[0], accountNumber: '', ifscCode: '', accountHolderName: '' });
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${ownerMode === 'new' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
              >
                New Business Owner
              </button>
              <button
                type="button"
                onClick={() => setOwnerMode('existing')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${ownerMode === 'existing' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Already Registered Owner
              </button>
            </div>

            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {ownerMode === 'existing' && (
                  <div className="relative z-20">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Select Existing Owner</label>
                    <div 
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setShowOwnerSelect(!showOwnerSelect);
                        setOwnerSearch('');
                      }}
                    >
                      <span className="truncate">
                        {formData.businessId ? (
                          <span className="font-semibold text-gray-900">{formData.ownerName} <span className="font-normal text-gray-500 ml-1">(ID: #{formData.businessId})</span></span>
                        ) : (
                          <span className="text-gray-500">Select an owner...</span>
                        )}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    {showOwnerSelect && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                              type="text" 
                              autoFocus
                              placeholder="Search owner..." 
                              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                              value={ownerSearch}
                              onChange={(e) => setOwnerSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).map(b => (
                            <div 
                              key={`opt_${b.id}`} 
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-100 last:border-0 transition-colors"
                              onClick={() => {
                                handleExistingOwnerChange({ target: { value: b.businessId } } as any);
                                setShowOwnerSelect(false);
                              }}
                            >
                              <span className="font-semibold text-gray-900">{b.ownerName}</span>
                              <span className="text-xs text-gray-500 mt-0.5">ID: #{b.businessId}</span>
                            </div>
                          ))}
                          {uniqueOwners.filter(b => b.ownerName.toLowerCase().includes(ownerSearch.toLowerCase()) || b.businessId.toLowerCase().includes(ownerSearch.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No owner found.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Owner ID Number {ownerMode === 'new' ? '(Auto-Generated)' : '(Linked)'}</label>
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full border border-gray-300 bg-gray-50 text-gray-500 font-mono rounded-lg p-3 outline-none cursor-not-allowed" 
                    value={formData.businessId} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Business Name</label>
                  <input 
                    required 
                    type="text" 
                    autoFocus
                    className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium focus:ring-2 focus:ring-black outline-none" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Acme Corp" 
                  />
                </div>

                {ownerMode === 'new' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Owner Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-black outline-none" 
                      value={formData.ownerName} 
                      onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                      placeholder="e.g. John Doe" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Funding Required (₹)</label>
                    <input 
                      required 
                      type="number" 
                      min="0"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
                      value={formData.fundingRequired} 
                      onChange={e => setFormData({...formData, fundingRequired: e.target.value})} 
                      placeholder="e.g. 500000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Interest Rate (%)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.1" 
                      min="0"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none" 
                      value={formData.interestRate} 
                      onChange={e => setFormData({...formData, interestRate: e.target.value})} 
                      placeholder="e.g. 12.5" 
                    />
                  </div>
                </div>

                {Number(formData.fundingRequired) > 0 && Number(formData.interestRate) > 0 && (
                  <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setShowInterestCalculation(!showInterestCalculation)}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2"
                    >
                      <span className="font-semibold text-gray-800 flex items-center space-x-2 min-w-0">
                        <span className="truncate">Show Interest Return Breakdown</span>
                      </span>
                      <span className="text-gray-500 text-xl flex-shrink-0">{showInterestCalculation ? '−' : '+'}</span>
                    </button>
                    {showInterestCalculation && (
                      <div className="p-4 bg-white border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Calculated Return to Investor</p>
                          <p className="text-xs text-gray-500 mt-0.5">Based on <span className="font-bold text-green-600">{formData.interestRate}%</span> interest rate applied on <span className="font-mono font-medium">{formatINR(Number(formData.fundingRequired))}</span>.</p>
                        </div>
                        <div className="text-left md:text-right flex flex-col gap-2 min-w-0">
                           <p className="text-sm font-semibold text-gray-600 border border-gray-100 bg-gray-50 px-3 py-1.5 rounded break-words whitespace-normal">
                             Monthly Return: <span className="font-bold font-mono text-black break-all">{formatINR((Number(formData.fundingRequired) * Number(formData.interestRate) / 100) / 12)}</span>
                           </p>
                           <p className="text-sm font-bold text-green-800 border border-green-100 bg-green-50 px-3 py-1.5 rounded break-words whitespace-normal">
                             Yearly Return: <span className="font-black font-mono text-green-900 break-all">{formatINR(Number(formData.fundingRequired) * Number(formData.interestRate) / 100)}</span>
                           </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    className={`w-full border border-gray-300 rounded-lg p-3 outline-none font-medium shadow-sm ${ownerMode === 'existing' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-black bg-white'}`}
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Account Number</label>
                  <input 
                    required 
                    type="text" 
                    className={`w-full border border-gray-300 rounded-lg p-3 font-mono outline-none shadow-sm ${ownerMode === 'existing' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-black'}`}
                    value={formData.accountNumber} 
                    onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} 
                    placeholder="e.g. 30291039482" 
                    readOnly={ownerMode === 'existing'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">IFSC Code</label>
                  <input 
                    required 
                    type="text" 
                    className={`w-full border border-gray-300 rounded-lg p-3 font-mono uppercase outline-none shadow-sm ${ownerMode === 'existing' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-black'}`}
                    value={formData.ifscCode} 
                    onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} 
                    placeholder="e.g. SBIN0001234" 
                    readOnly={ownerMode === 'existing'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Account Holder Name</label>
                  <input 
                    required 
                    type="text" 
                    className={`w-full border border-gray-300 rounded-lg p-3 font-bold uppercase outline-none shadow-sm ${ownerMode === 'existing' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-black focus:ring-2 focus:ring-black'}`}
                    value={formData.accountHolderName} 
                    onChange={e => setFormData({...formData, accountHolderName: e.target.value.toUpperCase()})} 
                    readOnly={ownerMode === 'existing'}
                  />
                  {ownerMode === 'existing' ? (
                    <p className="text-xs text-amber-600 mt-2 font-medium">Bank details are locked because this owner is already registered.</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">Auto-filled from Step 1. You can edit if bank account name differs.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Registration Fee (₹)</label>
                <input 
                  required 
                  type="number" 
                  className="w-full md:w-1/2 border border-blue-300 bg-blue-50/50 rounded-lg p-3 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                  value={formData.registrationFee} 
                  onChange={e => setFormData({...formData, registrationFee: e.target.value})} 
                  placeholder="Enter amount..." 
                />
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setViewMode('add-step-1')} className="px-6 py-2.5 font-semibold text-gray-500 hover:text-black">← Back</button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm">✓ Verified Business</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* --- PDF Modal Preview (Only visible when pdfBusiness is set, hidden during print) --- */}
      {pdfBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg text-black">Preview PDF Document</h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handlePrintPdf}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 flex items-center space-x-2 rounded-lg font-semibold transition"
                >
                  <Download size={16} />
                  <span>Download / Print</span>
                </button>
                <button 
                  onClick={() => setPdfBusiness(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Provide a visual boundary for the user before printing */}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div id="business-pdf-content" className="bg-white shadow-sm border border-gray-200 mx-auto max-w-3xl p-6 md:p-12 text-gray-900">
                <PdfContent business={pdfBusiness} isBlueTick={isBlueTick(pdfBusiness.id)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTUAL PRINTABLE CONTENT --- */}
      {pdfBusiness && (
        <div className="hidden print:block font-sans text-black">
           <PdfContent business={pdfBusiness} isBlueTick={isBlueTick(pdfBusiness.id)} />
        </div>
      )}

    </div>
  );
}

// Sub-component for the PDF Content to ensure it's rendered identically in Preview and Print
function PdfContent({ business, isBlueTick }: { business: Business, isBlueTick: boolean }) {
  return (
    <div className="space-y-6 leading-relaxed">
      <div className="text-center space-y-2 border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-black tracking-widest text-black">RADHIKA MA SERVICE</h1>
        <h2 className="text-lg font-bold text-gray-700 mt-2 uppercase tracking-wider">BUSINESS PROOF SERVICE GUIDELINES</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Business Profile</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="font-bold text-lg text-black">{business.name}</p>
            {isBlueTick && <BadgeCheck size={20} className="text-blue-500 fill-white" title="RMAS Verified" />}
          </div>
          <p className="font-semibold text-black mt-1">Owner: {business.ownerName}</p>
          <p className="font-mono text-sm text-gray-600 mt-0.5">ID: #{business.businessId}</p>
          <p className="text-sm text-gray-600 mt-0.5">Registered: {new Date(business.registrationDate).toLocaleDateString('en-IN')}</p>
          <div className="mt-2 text-sm">
            <span className="font-semibold mr-2">Funding required:</span>{formatINR(business.fundingRequired)}
          </div>
          <div className="text-sm">
            <span className="font-semibold mr-2">Interest Rate:</span>{business.interestRate}%
          </div>
        </div>
        {business.bankDetails && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Banking Profile</p>
            <p className="font-bold text-black mt-1">{business.bankDetails.bankName}</p>
            <p className="font-mono text-sm text-gray-600 mt-0.5">A/C: {business.bankDetails.accountNumber}</p>
            <p className="font-mono text-sm text-gray-600 mt-0.5">IFSC: {business.bankDetails.ifscCode}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">ACCOUNT HOLDER: {business.bankDetails.accountHolderName}</p>
          </div>
        )}
      </div>

      <div className="space-y-4 text-justify text-base">
        <p>
          <strong>RADHIKA MA SERVICE</strong> માં તમારો બસ્સીનેસ લિસ્ટેડ કર્યો તે બદલ હું <strong>RADHIKA MARCHANT AMBANI</strong> તમને અભિનંદન પાઠવું છું.
        </p>

        <p>
          તમારી કંપની નું પૂરું રજિસ્ટર અમે કરી દીધેલ છે જેમાં તમામ તમારા બસ્સીનેસ ના ડોક્યુમેન્ટ્સ અને <strong>HAPPY E TAX MUSLIM</strong> દ્વારા અને <strong>ABDULBHAI PATHAN</strong> દ્વારા તમને અમારે ત્યાં બસ્સીનેસ કરવાની પરવાનગી જરૂર આપી દીધેલે છે જેના તમામ રેકોર્ડ અને ડિટેલ્સ ચેક કર્યા બાદ જ તમને પરવાનગી જાહેર કરી છે હવે તમે જે ફંડિંગ એનાઉન્સ કર્યું છે અથવા પછી કરશો તે દરમિયાન ઈન્વેસ્ટર ને યોગ્ય લાગે તેમ તમારી કંપની માં ઇન્વેસ્ટ કરશે અને તમે જે ઇન્ટરેસ્ટ આપવાની જાહેરાત કરી છે તે મુજબ તેમની કમાણી ઉપર તે ચૂકવવાનું રહશે તેમાં <strong>HPG TAX RMAS TAX</strong> અલગ થી લાગુ પડશે.
        </p>

        <p>
          અમારી સર્વિસ માં તમે તમારો બસ્સીનેસ વેરિફાઈડ કર્યો તે દરમિયાન <strong>HAPPY MUSLIM INCOME TAX</strong> દ્વારા <strong>ABDULJI BHAI PATHAN</strong> દ્વારા લેવામાં આવતી દલાલી ફરજિયાત ચુકવવી પડસે જેથી તમારો બસ્સીનેસ અમારા કંપની માં જલ્દી આગળ વધશે કેમ કે <strong>ABDULJI BHAI PATHAN</strong> આપદા INDIA લેવલ ના તમામ બસ્સીનેસ માં દલાલી વસૂલે છે જે તમારે પણ આપવાની રહશે ત્યાં તમે ચુકવસો તો જ તમે આમાં રજિસ્ટર થસો ત્યાં થી અમને પરવાનગી મળે છે અનેનોંધ પત્ર લઈ ને બાદ TAX REGISTER ગણી ને અમારા <strong>RADHIKA MARCHANT ACCOUNT SERVICE</strong> માં વેરફાઈડ કરવાની પરવાનગી અમે તમને આપીએ છીએ.
        </p>

        <p>
          <strong>RADHIKA MA SERVICE</strong> માં જોડાયેલા investors જ માત્ર તમારે ત્યાં ઇન્વેસ્ટ કરશે જે થી અન્ય કંપની શિવાય ના કોઈ એજન્ટ અથવા કોઈ ની સલાહ મુજબ જો કોઈ ઇન્વેસ્ટ કરે તો તેના મૂળ જવાબદાર તમે અને તે હસો કેમ કે <strong>RMAS</strong> દ્વારા જે કોઈ INVESTORS હશે તે યોગ્ય અને સહાયક અમે અમારી ટીમ દ્વારા પૂરી જાણકારી તેમણે આપવામાં આવે છે ત્યાર બાદ તે ઇન્વેસ્ટ કરવાનું પસંદ કરે છે જેની અવશ્ય નોંધ લેવી.
        </p>

        <p>
          જો કોઈ ઇન્વેસ્ટર તમારે ત્યાં આવે અને કોઈ પર્સનલી વાત ચીત કરે તો તમારે તેમની પાસે થી તેમનો એક પર્સનલ ઇન્વેસ્ટર ID નંબર અમે રજૂ કરીએ છીએ તે માંગજો તે માંગી અમારા પ્લેટફોર્મ ઉપર સર્ચ કરવું અથવા યોગ્ય બને તો અમારી ટીમ ની સાથે કોન્ટેક્ટ કરવો જો સાચું હોય તો તેમની સાથે યોગ્યતા થી વાત કરવી તે તમને કોઈ નડતર રૂપ બનશે નહીં અમે તેમને કોઈ કારણોસર તમારે ત્યાં આવવાની પરવાનગી આપતા જ નથી પણ કોઈ બાહ્ય રૂપે આવે સંકપદ લાગે તો જ મુલાકાત લેશે.
        </p>

        <p>
          તમારા ઇન્વેસ્ટમેન્ટ માટે અમે તમને જે કોઈ ઇન્વેસ્ટર ઇન્વેસ્ટ કરે તે તમને 24 કલાક ની અંદર તમારા આપેલ બેન્ક અકાઉંટ માં જમા કરી દેશું અને તેમાં તમને તમામ રેકોર્ડ આપીશું જેમાં જે જે ઇન્વેસ્ટર છે તેમને કેટલા ટાઈમ પીરિયડ મુજબ ઇનેવસ્ટ કર્યા છે તેના ક્યારે પરત કરવા જેની તમામ લેણદેણ તમારા આપેલ બેન્ક દ્વારા જ કરવામાં આવશે.
        </p>
      </div>

      <div className="mt-6 bg-amber-50 border border-black p-5 rounded">
        <h4 className="font-bold text-lg text-black mb-3 pb-2 border-b border-gray-300">: ખાસ નોંધ :</h4>
        <p className="mb-3 text-justify">
          મહત્વ ની વાત દરેક બસ્સીનેસ દરરોજ અથવા કાયમ સ્થિર નથી રેહતો તે બદલ ઉતાર ચડાવ પણ જરૂર આવે છે તે દરમિયાન <strong>RMAS</strong> કંપની છે તે તમને જરૂર એક મદદગાર રૂપ બનશે
        </p>
        <ul className="list-disc pl-5 space-y-3 text-justify">
          <li>
            જેમાં જો જે ઇન્વેસ્ટર ના ટાઈમ પીરિયડ દરમિયાન તમારા થી તેમનું ઇન્વેસ્ટમેન્ટ સમયસર નથી થતું તો તમને તે ટાઈમ પીરિયડ લંબાવાનો સમય ગાળો આપીએ છીએ પરંતુ તે સમય ગાળા માં ઇન્ટરેસ્ટ નક્કી કરેલ મુજબ INVESSTOR ને ભરપાઈ કરવું અવશ્ય છે.
          </li>
          <li>
            અન્ય તા જો કોઈ ઇન્વેસ્ટર ને આપત્કાલીન ઇમર્જન્સિ જરૂરિયાત પડે છે તો તે ભલામણ કરે છે તે દરમિયાન અમે તેટલા ટાઈમ પીરિયડ દરમિયાન નો ઈન્વેસ્ટર નું ઇનેવસ્ટ અને કમાણી કંપની હાલ પૂરતી ચૂકવે છે તે તમારા રેકોર્ડ માં બાકી ખાતે નોંધાશે અને તેના ઉપર કોઈ અલગ થી વ્યાજદર કે એવું કંપની લેવામાં આવશે નહીં પરંતુ તે ઇનેવસ્ટમેન્ટ ની કમાણી કંપની એ પૂરી પાડી તે રીતે દર્શાવામાં આવશે અને તમે જ્યાં સુધી કંપની ને પરત નથી ચૂકવતા ત્યાં સુધી તમારા રેકોર્ડ માં બાકી ખાતે નોંધાશે જેવા તમે તે ભરપાઈ કરો છો તેવા તે જમા ખાતે નોંધાય જશે જે નો લિમિટેડ ટાઈમ પીરિયડ રહશે જેની નોંધ લેવી.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-2 h-12"></div>
          <p className="font-bold">Authorized Signatory</p>
          <p className="text-sm font-semibold text-gray-500">RADHIKA MA SERVICE</p>
        </div>
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-2 h-12"></div>
          <p className="font-bold">Business Owner</p>
          <p className="text-sm font-semibold text-gray-500">{business.ownerName}</p>
        </div>
      </div>
    </div>
  );
}
