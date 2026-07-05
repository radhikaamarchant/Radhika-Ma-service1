import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, ChevronRight, X, Briefcase, Plus, Check, Info, FileText, Settings, Trash2, Edit2 } from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { getUnifiedBankBalance } from "../utils/bankBalance";

interface IPO {
  id: string;
  companyName: string;
  industry: string;
  issueSize: number;
  priceBandMin: number;
  priceBandMax: number;
  issuePrice: number | null;
  lotSize: number;
  minInvestment: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
  registrar: string;
  exchange: string;
  prospectusPdf: string;
  description: string;
  status: 'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming' | 'Not Allotted' | 'Pending Allotment';
  capacity?: number;
  timeline: {
    biddingStart: string;
    biddingEnd: string;
    allotment: string;
    refunds: string;
    dematTransfer: string;
    listing: string;
  };
}

interface IPOApplication {
  id: string;
  ipoId: string;
  investorId: string;
  lotsApplied: number;
  appliedAmount: number;
  commissionPaid: number;
  applicationDate: string;
  applicationStatus: 'Active' | 'Cancelled';
  allotmentStatus: 'Pending' | 'Allotted' | 'Not Allotted';
  refundStatus: 'N/A' | 'Refunded';
  listingStatus: 'N/A' | 'Listed';
}

interface CommissionRecord {
  id: string;
  type: 'Application' | 'Exit' | 'IPO Listing';
  ipoId: string;
  investorId: string;
  amount: number;
  date: string;
}


function KiteDropdown({ value, onChange, options, placeholder, label }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedOption = options.find((o: any) => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : search;
  
  const filteredOptions = options.filter((o: any) => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-kite-text-light mb-1 text-[11px] uppercase">{label}</label>
      <div 
        className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-white dark:bg-[#2A2A2A] text-[13px] flex items-center cursor-text relative"
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text" 
          className="w-full bg-transparent outline-none"
          value={isOpen ? search : (selectedOption ? selectedOption.label : '')}
          onChange={e => {
             setSearch(e.target.value);
             if(!isOpen) setIsOpen(true);
          }}
          onFocus={() => { setIsOpen(true); setSearch(''); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
        />
        <ChevronRight className={`w-4 h-4 text-kite-text-light transition-transform absolute right-2 top-1/2 -translate-y-1/2 ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#2A2A2A] border border-kite-border-soft rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? filteredOptions.map((o: any) => (
            <div 
              key={o.value} 
              className="px-3 py-2 text-[12px] hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
              onClick={() => {
                onChange(o.value);
                setSearch('');
                setIsOpen(false);
              }}
            >
              {o.label}
            </div>
          )) : (
            <div className="px-3 py-2 text-[12px] text-kite-text-light">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Bids() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming'>('Listed');
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [applications, setApplications] = useState<IPOApplication[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [exchangeFilter, setExchangeFilter] = useState("All");
  
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  
  const [adminForm, setAdminForm] = useState<Partial<IPO>>({});

  useEffect(() => {
    const savedIpos = localStorage.getItem("bids_ipos");
    if (savedIpos) setIpos(JSON.parse(savedIpos));
    
    const savedApps = localStorage.getItem("bids_applications");
    if (savedApps) setApplications(JSON.parse(savedApps));
    
    const savedComms = localStorage.getItem("bids_commissions");
    if (savedComms) setCommissions(JSON.parse(savedComms));
  }, []);

  const saveIpos = (data: IPO[]) => {
    setIpos(data);
    localStorage.setItem("bids_ipos", JSON.stringify(data));
  };
  
  const saveApplications = (data: IPOApplication[]) => {
    setApplications(data);
    localStorage.setItem("bids_applications", JSON.stringify(data));
  };
  
  const saveCommissions = (data: CommissionRecord[]) => {
    setCommissions(data);
    localStorage.setItem("bids_commissions", JSON.stringify(data));
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  
  const filteredIpos = ipos.filter(ipo => {
    if (activeTab !== ipo.status) return false;
    if (searchQuery && !ipo.companyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (exchangeFilter !== "All" && ipo.exchange !== exchangeFilter) return false;
    return true;
  });

  const handleApply = (ipo: IPO) => {
    setSelectedIpo(ipo);
    setIsApplyOpen(true);
  };
  
  const handleView = (ipo: IPO) => {
    setSelectedIpo(ipo);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-kite-bg text-kite-text font-sans relative">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-kite-border-soft shrink-0">
        <h1 className="text-[17px] md:text-[18px] font-medium text-kite-text uppercase">Bids</h1>
        <button 
          onClick={() => setIsAdminView(!isAdminView)}
          className="text-kite-text-light hover:text-kite-blue transition-colors flex items-center gap-1 text-[12px]"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>
      
      {isAdminView ? (
        <AdminBidsView 
          ipos={ipos} 
          saveIpos={saveIpos} 
          commissions={commissions}
          saveCommissions={saveCommissions}
          applications={applications}
          saveApplications={saveApplications}
          onClose={() => setIsAdminView(false)}
        />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-kite-border-soft px-6 shrink-0">
            {(['Listed', 'Funded', 'Allotted', 'Closed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[13px] font-medium uppercase tracking-wide relative ${activeTab === tab ? 'text-kite-blue' : 'text-kite-text-light hover:text-kite-text'}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue" />
                )}
              </button>
            ))}
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-kite-border-soft shrink-0">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-kite-text-light" />
              <input 
                type="text"
                placeholder="Search IPO..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white dark:bg-[#2A2A2A] border border-kite-border-soft rounded-sm focus:outline-none focus:border-kite-blue text-kite-text"
              />
            </div>
            
            <select 
              value={exchangeFilter}
              onChange={e => setExchangeFilter(e.target.value)}
              className="px-2 py-1.5 text-[12px] bg-white dark:bg-[#2A2A2A] border border-kite-border-soft rounded-sm focus:outline-none text-kite-text outline-none"
            >
              <option value="All">All Exchanges</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>
          
          {/* Table Container */}
          <div className="flex-1 overflow-auto">
              <div className="min-w-[1000px]">
                <div className="flex items-center px-6 py-2 text-[11px] text-kite-text-light font-normal tracking-wide uppercase border-b border-kite-border-soft bg-kite-surface">
                  <div className="w-[18%]">Company</div>
                  <div className="w-[12%] text-right">Price Band</div>
                  <div className="w-[8%] text-right">Lot Size</div>
                  <div className="w-[12%] text-right">Min Inv.</div>
                  <div className="w-[10%] text-right">Open Date</div>
                  <div className="w-[10%] text-right">Close Date</div>
                  <div className="w-[10%] text-right">Listing Date</div>
                  <div className="w-[8%] text-center">Exchange</div>
                  <div className="w-[12%] text-right">Action</div>
                </div>
                
                {filteredIpos.length === 0 ? (
                  <div className="py-12 text-center text-kite-text-light text-[13px]">
                    No IPOs found in {activeTab} status.
                  </div>
                ) : (
                  filteredIpos.map(ipo => {
                    const hasApplied = applications.some((app: any) => app.ipoId === ipo.id);
                    return (
                    <div key={ipo.id} className="flex items-center px-6 py-3 text-[13px] border-b border-kite-border-soft hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors group">
                      <div className="w-[18%] font-medium text-kite-text truncate pr-2">{ipo.companyName} {hasApplied && <span className="ml-2 px-1.5 py-0.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded text-[9px] uppercase tracking-wider">Applied</span>}</div>
                      <div className="w-[12%] text-right text-kite-text-light">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</div>
                      <div className="w-[8%] text-right text-kite-text-light">{ipo.lotSize}</div>
                      <div className="w-[12%] text-right text-kite-text-light">{formatINR(ipo.minInvestment)}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.openDate}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.closeDate}</div>
                      <div className="w-[10%] text-right text-kite-text-light">{ipo.listingDate}</div>
                      <div className="w-[8%] text-center text-kite-text-light">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2A2A] rounded text-[10px]">{ipo.exchange}</span>
                      </div>
                      <div className="w-[12%] flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(ipo)} className="text-kite-blue hover:underline text-[12px]">View</button>
                        {(ipo.status === 'Listed') && (
                          <button onClick={() => handleApply(ipo)} className="bg-kite-blue text-white px-3 py-1 rounded-sm text-[12px] hover:bg-blue-600">Apply</button>
                        )}
                        {hasApplied && (
                          <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Applied</span>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>
          </div>
        </div>
      )}
      
      {isDetailsOpen && selectedIpo && (
        <DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} applications={applications} saveApplications={saveApplications} commissions={commissions} saveCommissions={saveCommissions} />
      )}
      
      {isApplyOpen && selectedIpo && (
        <ApplyModal 
          ipo={selectedIpo} 
          ipos={ipos}
          saveIpos={saveIpos}
          onClose={() => setIsApplyOpen(false)} 
          applications={applications}
          saveApplications={saveApplications}
          commissions={commissions}
          saveCommissions={saveCommissions}
        />
      )}
    </div>
  );
}

function AdminBidsView({ ipos, saveIpos, commissions, saveCommissions, applications, saveApplications, onClose }: any) {
  const { state } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingIpo, setEditingIpo] = useState<Partial<IPO>>({});

  const { dispatch } = useAppContext();
  
  const handleSave = () => {
    if (!editingIpo.companyName) return alert("Please select a company name");
    
    if (editingIpo.id) {
      const oldIpo = ipos.find((i: any) => i.id === editingIpo.id);
      saveIpos(ipos.map((i: any) => i.id === editingIpo.id ? { ...i, ...editingIpo } : i));
      
      // Automatic Allotment and Listing Logic
      if (oldIpo && oldIpo.status !== editingIpo.status) {
         let updatedApps = [...applications];
         let modifiedApps = false;
         
         if (editingIpo.status === 'Allotted' || editingIpo.status === 'Listed') {
            updatedApps = updatedApps.map((app: any) => {
              if (app.ipoId === editingIpo.id && app.applicationStatus !== 'Cancelled' && app.allotmentStatus === 'Pending') {
                 modifiedApps = true;
                 return { ...app, allotmentStatus: 'Allotted', allottedLots: app.lotsApplied };
              }
              return app;
            });
         }
         
         if (editingIpo.status === 'Not Allotted') {
            updatedApps = updatedApps.map((app: any) => {
              if (app.ipoId === editingIpo.id && app.applicationStatus !== 'Cancelled' && app.allotmentStatus === 'Pending') {
                 modifiedApps = true;
                 return { ...app, allotmentStatus: 'Not Allotted', refundStatus: 'Refunded' };
              }
              return app;
            });
         }
         
         if (editingIpo.status === 'Closed' || editingIpo.status === 'Pending Allotment') {
            // leave them as Pending
         }
         
         if (editingIpo.status === 'Listed') {
            updatedApps = updatedApps.map((app: any) => {
               if (app.ipoId === editingIpo.id && app.allotmentStatus === 'Allotted' && app.listingStatus !== 'Listed') {
                  modifiedApps = true;
                  // Create Investment
                  const bizId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === editingIpo.companyName)?.id || 'admin_business';
                  const inv = {
                     id: `inv_ipo_${app.id}`,
                     businessId: bizId,
                     investorId: app.investorId,
                     amount: app.appliedAmount,
                     startDate: new Date().toISOString(),
                     status: 'active',
                     payoutDetails: null,
                     adminCommissionBusiness: 0,
                     adminCommissionInvestor: 0
                  };
                  // We would dispatch this but this isn't an async function, we can do it inside try/catch without await
                  dispatch({ type: 'ADD_INVESTMENT', payload: inv as any });
                  
                  return { ...app, listingStatus: 'Listed' };
               }
               return app;
            });
         }
         
         if (modifiedApps) {
            saveApplications(updatedApps);
         }
      }
      
    } else {
      const newIpo = {
        ...editingIpo,
        id: Math.random().toString(36).substr(2, 9), status: editingIpo.status || 'Listed',
      } as IPO;
      saveIpos([...ipos, newIpo]);
      
      const charge = (editingIpo as any).rmasListingCharge;
      if (charge && charge > 0) {
        const businessId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === editingIpo.companyName)?.id || 'admin_business';
        const newComm = {
          id: Math.random().toString(36).substr(2, 9), status: editingIpo.status || 'Listed',
          type: 'IPO Listing',
          ipoId: newIpo.id,
          investorId: businessId,
          amount: charge,
          date: new Date().toISOString()
        };
        saveCommissions([...commissions, newComm] as any);
      }
    }
    setIsCreating(false);
    setEditingIpo({});
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#121212]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-medium text-kite-text">Admin IPO Management</h2>
        <div className="flex gap-2">
           <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 bg-kite-blue text-white px-3 py-1.5 rounded-sm text-[12px]"><Plus className="w-3.5 h-3.5"/> Create IPO</button>
           <button onClick={onClose} className="px-3 py-1.5 border border-kite-border-soft rounded-sm text-[12px] text-kite-text hover:bg-gray-100 dark:hover:bg-[#202020]">Back to Bids</button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-kite-surface border border-kite-border-soft p-4 rounded-sm mb-6 grid grid-cols-3 gap-4 text-[13px]">
          <KiteDropdown 
  label="Company Name" 
  placeholder="Search business..."
  value={editingIpo.companyName || ''}
  onChange={(val: string) => setEditingIpo({...editingIpo, companyName: val})}
  options={state.businesses.map((b: any) => ({ value: b.shortName?.toUpperCase() || b.name.toUpperCase(), label: b.name.toUpperCase() }))}
/>
          <div>
            <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Status</label>
            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Listed'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Listed">Listed</option>
              <option value="Funded">Funded</option>
              <option value="Allotted">Allotted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Select Capacity</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.capacity ? Number(editingIpo.capacity).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, capacity: raw ? parseInt(raw, 10) : undefined}); }} placeholder="e.g. 200" />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Min</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.priceBandMin ? Number(editingIpo.priceBandMin).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, priceBandMin: raw ? parseInt(raw, 10) : ('' as any)}); }} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Max</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.priceBandMax ? Number(editingIpo.priceBandMax).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, priceBandMax: raw ? parseInt(raw, 10) : ('' as any)}); }} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Lot Size</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.lotSize ? Number(editingIpo.lotSize).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, lotSize: raw ? parseInt(raw, 10) : ('' as any)}); }} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Min Investment</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.minInvestment ? Number(editingIpo.minInvestment).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, minInvestment: raw ? parseInt(raw, 10) : ('' as any)}); }} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">RMAS Admin Charge</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={(editingIpo as any).rmasListingCharge ? Number((editingIpo as any).rmasListingCharge).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, rmasListingCharge: raw ? parseInt(raw, 10) : ('' as any)} as any); }} />
          </div>
          <div className="col-span-3 flex justify-end gap-2 mt-2">
            <button onClick={() => setIsCreating(false)} className="px-4 py-1.5 border border-kite-border-soft rounded-sm hover:bg-gray-50 dark:hover:bg-[#202020]">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-kite-green text-white rounded-sm">Save</button>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-kite-surface border border-kite-border-soft rounded-sm">
        <div className="flex items-center px-4 py-2 border-b border-kite-border-soft bg-gray-50 dark:bg-[#1A1A1A] text-[11px] text-kite-text-light uppercase tracking-wide">
          <div className="w-[20%]">Company</div>
          <div className="w-[15%]">Status</div>
          <div className="w-[15%] text-right">Price Band</div>
          <div className="w-[15%] text-right">Lot Size</div>
          <div className="w-[15%] text-right">Min Inv</div>
          <div className="w-[20%] text-right">Actions</div>
        </div>
        {ipos.map((ipo: any) => (
          <div key={ipo.id} className="flex items-center px-4 py-3 border-b border-kite-border-soft text-[13px] hover:bg-gray-50 dark:hover:bg-[#202020]">
             <div className="w-[20%] font-medium text-kite-text">{ipo.companyName}</div>
             <div className="w-[15%] text-kite-text-light">{ipo.status}</div>
             <div className="w-[15%] text-right text-kite-text-light">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</div>
             <div className="w-[15%] text-right text-kite-text-light">{ipo.lotSize}</div>
             <div className="w-[15%] text-right text-kite-text-light">₹{ipo.minInvestment}</div>
             <div className="w-[20%] flex justify-end gap-3">
               <button onClick={() => { setEditingIpo(ipo); setIsCreating(true); }} className="text-kite-blue hover:underline">Edit</button>
               <button onClick={() => saveIpos(ipos.filter((i: any) => i.id !== ipo.id))} className="text-kite-red hover:underline">Delete</button>
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-[14px] font-medium text-kite-text mb-3">Commission Records (1% per action)</h3>
        <div className="bg-white dark:bg-kite-surface border border-kite-border-soft rounded-sm p-4">
           {commissions.length === 0 ? <p className="text-[12px] text-kite-text-light">No commissions recorded yet.</p> : (
             <div className="text-[12px]">
               {commissions.map((c: any) => (
                 <div key={c.id} className="flex justify-between py-1 border-b border-kite-border-soft last:border-0">
                   <span className="text-kite-text-light">{new Date(c.date).toLocaleDateString()} - {c.type}</span>
                   <span className="text-kite-green font-medium">+ ₹{c.amount.toFixed(2)}</span>
                 </div>
               ))}
               <div className="flex justify-between pt-2 mt-2 border-t border-kite-border-soft font-medium">
                  <span>Total Earned:</span>
                  <span className="text-kite-green">₹{commissions.reduce((acc: number, c: any) => acc + c.amount, 0).toFixed(2)}</span>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ ipo, onClose, onApply, applications, saveApplications, commissions, saveCommissions }: any) {
  const myApps = applications?.filter((a: any) => a.ipoId === ipo.id) || [];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-kite-bg w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-kite-border-soft">
           <div>
             <h2 className="text-[18px] font-medium text-kite-text">{ipo.companyName}</h2>
             <p className="text-[12px] text-kite-text-light">{ipo.exchange} • {ipo.status}</p>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#202020] rounded"><X className="w-5 h-5 text-kite-text-light" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-[13px]">
           
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 rounded border border-kite-border-soft flex items-center justify-center bg-gray-50 dark:bg-[#2A2A2A] text-lg font-bold text-kite-text-light">
                {ipo.companyName.charAt(0)}
             </div>
             <div>
               <p className="text-[14px] font-medium text-kite-text">{ipo.companyName}</p>
               <p className="text-[12px] text-kite-text-light">Industry: {ipo.industry || 'N/A'} • Registrar: {ipo.registrar || 'N/A'}</p>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6 mb-8 border-b border-kite-border-soft pb-8">
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Issue Size</p>
               <p className="text-[14px] font-medium text-kite-text">{ipo.issueSize ? `₹${ipo.issueSize} Cr` : 'TBD'}</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Price Band</p>
               <p className="text-[14px] font-medium text-kite-text">₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Lot Size</p>
               <p className="text-[14px] font-medium text-kite-text">{ipo.lotSize} shares</p>
             </div>
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Min Investment</p>
               <p className="text-[14px] font-medium text-kite-text">₹{ipo.minInvestment}</p>
             </div>
           </div>
           
           {ipo.description && (
             <div className="mb-8">
               <h3 className="text-[14px] font-medium text-kite-text mb-2">Company Description</h3>
               <p className="text-kite-text-light text-[13px] leading-relaxed">{ipo.description}</p>
             </div>
           )}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <h3 className="text-[14px] font-medium text-kite-text mb-4">IPO Timeline</h3>
               <div className="space-y-4">
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Bidding Starts</span>
                   <span className="text-kite-text font-medium">{ipo.openDate || 'TBD'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Bidding Ends</span>
                   <span className="text-kite-text font-medium">{ipo.closeDate || 'TBD'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-kite-text-light">Listing Date</span>
                   <span className="text-kite-text font-medium">{ipo.listingDate || 'TBD'}</span>
                 </div>
               </div>
             </div>
             
             
             {myApps.length > 0 && (
               <div>
                 <h3 className="text-[14px] font-medium text-kite-text mb-4">Applications ({myApps.length})</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                   {myApps.map((myApp: any) => {
                     const isBlocked = myApp.applicationStatus === 'Active' && myApp.allotmentStatus === 'Pending';
                     const isRefunded = myApp.applicationStatus === 'Cancelled' || myApp.allotmentStatus === 'Not Allotted';
                     const isTransferred = myApp.allotmentStatus === 'Allotted';
                     
                     let moneyStatus = 'Available';
                     if (isBlocked) moneyStatus = 'Locked IPO Balance';
                     else if (isRefunded) moneyStatus = 'Refunded';
                     else if (isTransferred) moneyStatus = 'Transferred to Business Owner';
                     
                     return (
                     <div key={myApp.id} className="bg-blue-50/50 dark:bg-blue-900/5 border border-kite-border-soft p-4 rounded space-y-3">
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Application Date</span>
                         <span className="text-kite-text font-medium">{new Date(myApp.applicationDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Applied Lots</span>
                         <span className="text-kite-text font-medium">{myApp.lotsApplied}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">IPO Amount</span>
                         <span className="text-kite-text font-medium">₹{myApp.appliedAmount.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Platform Fee (1%)</span>
                         <span className="text-kite-text font-medium">₹{(myApp.commissionPaid || 0).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Total Paid</span>
                         <span className="text-kite-text font-medium">₹{(myApp.appliedAmount + (myApp.commissionPaid || 0)).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Locked Amount</span>
                         <span className="text-kite-text font-medium">₹{isBlocked ? myApp.appliedAmount.toLocaleString('en-IN') : '0'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Application Status</span>
                         <span className="text-kite-text font-medium">{myApp.applicationStatus || 'Active'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Allotment Status</span>
                         <span className="text-kite-text font-medium">{myApp.allotmentStatus}</span>
                       </div>
                       {isRefunded ? (
                         <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded">
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Status</span>
                             <span className="text-kite-green font-medium">Refund Completed</span>
                           </div>
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Amount</span>
                             <span className="text-kite-text font-medium">₹{myApp.appliedAmount.toLocaleString('en-IN')}</span>
                           </div>
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Date</span>
                             <span className="text-kite-text font-medium">{new Date().toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-kite-text-light">Application</span>
                             <span className="text-kite-text font-medium">Closed</span>
                           </div>
                         </div>
                       ) : (
                         <div className="flex justify-between">
                           <span className="text-kite-text-light">Refund Status</span>
                           <span className="text-kite-text font-medium">{myApp.refundStatus}</span>
                         </div>
                       )}
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Listing Status</span>
                         <span className="text-kite-text font-medium">{myApp.listingStatus}</span>
                       </div>
                       <div className="mt-4 pt-3 border-t border-kite-border-soft flex justify-between items-center">
                         <span className="text-[11px] text-kite-text-light uppercase tracking-wider">Funds Status</span>
                         <span className="text-[12px] font-medium bg-kite-bg px-2 py-1 rounded">{moneyStatus}</span>
                       </div>
                       
                       {ipo.status === 'Open' && myApp.applicationStatus !== 'Cancelled' && (
                          <button 
                             onClick={() => {
                              const newApps = applications.map((a: any) => a.id === myApp.id ? { ...a, applicationStatus: 'Cancelled', refundStatus: 'Refunded' } : a);
                              saveApplications(newApps as any);
                              alert(`Application Cancelled!

₹${myApp.appliedAmount.toLocaleString('en-IN')} has been unlocked and returned to your Available Balance.
Platform Commission is non-refundable.`);
                            }} 
                             className="w-full mt-2 border border-kite-red text-kite-red px-3 py-2 rounded-sm text-[12px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                          >
                            Cancel Application
                          </button>
                       )}
                       
                       {ipo.status === 'Listed' && myApp.allotmentStatus === 'Allotted' && (
                          <button 
                             onClick={() => {
                               // Just an info message since prompt says selling is from Holdings page
                               alert("Please go to the Investments page to View or Sell your Holdings.");
                             }} 
                             className="w-full mt-2 bg-kite-blue text-white px-3 py-2 rounded-sm text-[12px] hover:bg-blue-600 transition-colors font-medium"
                          >
                            View Holdings
                          </button>
                       )}
                     </div>
                   );
                   })}
                 </div>
               </div>
             )}

           </div>
           
        </div>
        <div className="p-4 border-t border-kite-border-soft flex justify-end gap-3 bg-gray-50 dark:bg-kite-surface shrink-0">
           {ipo.prospectusPdf && (
              <a href={ipo.prospectusPdf} target="_blank" rel="noreferrer" className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-white dark:hover:bg-[#202020] text-kite-blue flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Prospectus
              </a>
           )}
           <button onClick={onClose} className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-white dark:hover:bg-[#202020]">Close</button>
           {(ipo.status === 'Listed') && (
             <button onClick={onApply} className="px-5 py-2 bg-kite-blue text-white rounded-sm text-[13px] font-medium hover:bg-blue-600">Apply for IPO</button>
           )}
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ ipo, ipos, saveIpos, onClose, applications, saveApplications, commissions, saveCommissions }: any) {
  const { state } = useAppContext();
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [lots, setLots] = useState(1);
  
  const selectedInvestor = state.investors.find(i => i.id === selectedInvestorId);
  const amount = ipo.priceBandMax * ipo.lotSize * lots;

  const handleApply = () => {
    if (!selectedInvestorId) return alert("Please select an investor");
    if (!selectedInvestor) return;
        
    if (ipo.capacity) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length;
      if (currentAppsCount >= ipo.capacity) {
        alert("This IPO has reached its maximum capacity. You can no longer apply.");
        return;
      }
    }

    const commissionAmount = amount * 0.01;
    const totalRequired = amount + commissionAmount;
    
    const currentBalance = getUnifiedBankBalance(
      selectedInvestor.name,
      state.businesses,
      state.investors,
      state.investments,
      state.settings
    );
    
    if (currentBalance < totalRequired) {
      alert(`Bank ma balance nathi (Insufficient Balance).\n\nRequired: ₹${totalRequired.toLocaleString('en-IN')} (Includes 1% Platform Commission of ₹${commissionAmount.toLocaleString('en-IN')})\nAvailable: ₹${currentBalance.toLocaleString('en-IN')}`);
      return;
    }
    
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      lotsApplied: lots,
      appliedAmount: amount,
      commissionPaid: commissionAmount,
      applicationDate: new Date().toISOString(),
      applicationStatus: 'Active',
      allotmentStatus: 'Pending',
      refundStatus: 'N/A',
      listingStatus: 'N/A'
    };
    
    const bizId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === ipo.companyName)?.id || 'admin_business';
    
    const newComm = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Application',
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      businessId: bizId,
      amount: commissionAmount,
      date: new Date().toISOString()
    };
    
    saveApplications([...applications, newApp]);
    saveCommissions([...commissions, newComm]);
    
    
    if (ipo.capacity && ipos && saveIpos) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length + 1;
      if (currentAppsCount >= ipo.capacity) {
         const updatedIpos = ipos.map((i: any) => i.id === ipo.id ? { ...i, status: 'Funded' } : i);
         saveIpos(updatedIpos);
         // Also update local state
         
      }
    }

    alert(`Application successful!\n\n₹${amount.toLocaleString('en-IN')} has been locked in your Locked IPO Balance.\n₹${commissionAmount.toLocaleString('en-IN')} Platform Commission deducted.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-kite-bg w-full max-w-md rounded-sm shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-kite-border-soft">
           <h2 className="text-[16px] font-medium text-kite-text">Apply for {ipo.companyName}</h2>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#202020] rounded"><X className="w-5 h-5 text-kite-text-light" /></button>
        </div>
        <div className="p-5 text-[13px]">
           <div className="mb-5">
             <KiteDropdown 
  label="Select Investor Profile" 
  placeholder="Search investor..."
  value={selectedInvestorId}
  onChange={setSelectedInvestorId}
  options={state.investors.map((inv: any) => ({ value: inv.id, label: `${inv.name.toUpperCase()} (${inv.investorId})` }))}
/>
             {selectedInvestor && (
               <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 text-kite-blue rounded-sm text-[12px] flex items-start gap-2">
                 <Check className="w-4 h-4 shrink-0 mt-0.5" />
                 <div>
                   <p className="font-medium">Profile Linked</p>
                   <p className="opacity-80">Bank: {selectedInvestor.bankDetails.bankName}</p>
                 </div>
               </div>
             )}
           </div>
           
           <div className="mb-5">
             <label className="block text-[11px] text-kite-text-light uppercase tracking-wide mb-2">Quantity (Lots)</label>
             <div className="flex items-center gap-4">
               <input 
                 type="number" 
                 min="1" max="13" 
                 value={lots} 
                 onChange={e => setLots(Number(e.target.value))}
                 className="w-24 border border-kite-border-soft bg-transparent rounded-sm p-2 text-kite-text outline-none focus:border-kite-blue text-center"
               />
               <span className="text-kite-text-light text-[12px]">x {ipo.lotSize} shares = {lots * ipo.lotSize} shares</span>
             </div>
           </div>
           
           <div className="p-4 bg-gray-50 dark:bg-kite-surface border border-kite-border-soft rounded-sm">
             <div className="flex justify-between mb-2">
               <span className="text-kite-text-light">Amount Payable</span>
               <span className="font-medium text-kite-text">₹{(amount).toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between text-[11px]">
               <span className="text-kite-text-light">1% Commission</span>
               <span className="text-kite-text-light">₹{(amount * 0.01).toLocaleString('en-IN')}</span>
             </div>
           </div>
        </div>
        <div className="p-4 border-t border-kite-border-soft flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-gray-50 dark:hover:bg-[#202020]">Cancel</button>
           <button onClick={handleApply} disabled={!selectedInvestorId} className="px-5 py-2 bg-kite-blue text-white rounded-sm text-[13px] font-medium hover:bg-blue-600 disabled:opacity-50">Confirm Application</button>
        </div>
      </div>
    </div>
  );
}
