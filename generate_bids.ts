import fs from 'fs';

const content = `import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, ChevronRight, X, Briefcase, Plus, Check, Info, FileText, Settings, Trash2, Edit2 } from "lucide-react";
import { useAppContext } from "../utils/AppContext";

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
  status: 'Upcoming' | 'Open' | 'Closed' | 'Allotted' | 'Listed';
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
  applicationDate: string;
  allotmentStatus: 'Pending' | 'Allotted' | 'Rejected' | 'Partially Allotted';
  allottedLots: number;
  refundStatus: 'N/A' | 'Pending' | 'Refunded';
  listingStatus: 'N/A' | 'Listed' | 'Exited';
}

interface CommissionRecord {
  id: string;
  type: 'Application' | 'Exit';
  ipoId: string;
  investorId: string;
  amount: number;
  date: string;
}

export default function Bids() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed'>('Open');
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
          applications={applications} 
          onClose={() => setIsAdminView(false)} 
        />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-kite-border-soft px-6 shrink-0">
            {(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-4 py-3 text-[13px] font-medium uppercase tracking-wide relative \${activeTab === tab ? 'text-kite-blue' : 'text-kite-text-light hover:text-kite-text'}\`}
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
          
          {/* Table */}
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
                filteredIpos.map(ipo => (
                  <div key={ipo.id} className="flex items-center px-6 py-3 text-[13px] border-b border-kite-border-soft hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors group">
                    <div className="w-[18%] font-medium text-kite-text truncate pr-2">{ipo.companyName}</div>
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
                      {(ipo.status === 'Open' || ipo.status === 'Upcoming') && (
                        <button onClick={() => handleApply(ipo)} className="bg-kite-blue text-white px-3 py-1 rounded-sm text-[12px] hover:bg-blue-600">Apply</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {isDetailsOpen && selectedIpo && (
        <DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} />
      )}
      
      {isApplyOpen && selectedIpo && (
        <ApplyModal 
          ipo={selectedIpo} 
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

function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingIpo, setEditingIpo] = useState<Partial<IPO>>({});

  const handleSave = () => {
    if (!editingIpo.companyName || !editingIpo.priceBandMin || !editingIpo.status) return alert("Fill required fields");
    
    if (editingIpo.id) {
      saveIpos(ipos.map((i: any) => i.id === editingIpo.id ? { ...i, ...editingIpo } : i));
    } else {
      const newIpo = {
        ...editingIpo,
        id: Math.random().toString(36).substr(2, 9),
      } as IPO;
      saveIpos([...ipos, newIpo]);
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
          <div>
            <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Company Name</label>
            <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.companyName || ''} onChange={e => setEditingIpo({...editingIpo, companyName: e.target.value})} />
          </div>
          <div>
            <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Status</label>
            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Upcoming'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Upcoming">Upcoming</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Allotted">Allotted</option>
              <option value="Listed">Listed</option>
            </select>
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Min</label>
             <input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.priceBandMin || ''} onChange={e => setEditingIpo({...editingIpo, priceBandMin: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Max</label>
             <input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.priceBandMax || ''} onChange={e => setEditingIpo({...editingIpo, priceBandMax: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Lot Size</label>
             <input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.lotSize || ''} onChange={e => setEditingIpo({...editingIpo, lotSize: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Min Investment</label>
             <input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.minInvestment || ''} onChange={e => setEditingIpo({...editingIpo, minInvestment: Number(e.target.value)})} />
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

function DetailsModal({ ipo, onClose, onApply }: any) {
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
           <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8">
             <div>
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Issue Size</p>
               <p className="text-[14px] font-medium text-kite-text">{ipo.issueSize ? \`₹\${ipo.issueSize} Cr\` : 'TBD'}</p>
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
               <p className="text-[11px] text-kite-text-light uppercase tracking-wide mb-1">Minimum Investment</p>
               <p className="text-[14px] font-medium text-kite-text">₹{ipo.minInvestment}</p>
             </div>
           </div>
           
           <h3 className="text-[14px] font-medium text-kite-text mb-4 border-b border-kite-border-soft pb-2">IPO Timeline</h3>
           <div className="space-y-4 mb-8">
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
        <div className="p-4 border-t border-kite-border-soft flex justify-end gap-3 bg-gray-50 dark:bg-kite-surface">
           <button onClick={onClose} className="px-5 py-2 border border-kite-border-soft rounded-sm text-[13px] hover:bg-white dark:hover:bg-[#202020]">Close</button>
           {(ipo.status === 'Open' || ipo.status === 'Upcoming') && (
             <button onClick={onApply} className="px-5 py-2 bg-kite-blue text-white rounded-sm text-[13px] font-medium hover:bg-blue-600">Apply for IPO</button>
           )}
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ ipo, onClose, applications, saveApplications, commissions, saveCommissions }: any) {
  const { state } = useAppContext();
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [lots, setLots] = useState(1);
  
  const selectedInvestor = state.investors.find(i => i.id === selectedInvestorId);
  const amount = ipo.priceBandMax * ipo.lotSize * lots;

  const handleApply = () => {
    if (!selectedInvestorId) return alert("Please select an investor");
    
    // 1% commission calculation
    const commissionAmount = amount * 0.01;
    
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      lotsApplied: lots,
      appliedAmount: amount,
      applicationDate: new Date().toISOString(),
      allotmentStatus: 'Pending',
      allottedLots: 0,
      refundStatus: 'N/A',
      listingStatus: 'N/A'
    };
    
    const newComm = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Application',
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      amount: commissionAmount,
      date: new Date().toISOString()
    };
    
    saveApplications([...applications, newApp]);
    saveCommissions([...commissions, newComm]);
    
    alert(\`Application successful! 1% commission (₹\${commissionAmount.toFixed(2)}) charged.\`);
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
             <label className="block text-[11px] text-kite-text-light uppercase tracking-wide mb-2">Select Investor Profile</label>
             <select 
               value={selectedInvestorId} 
               onChange={e => setSelectedInvestorId(e.target.value)}
               className="w-full border border-kite-border-soft bg-transparent rounded-sm p-2 text-kite-text outline-none focus:border-kite-blue"
             >
               <option value="">-- Choose Investor --</option>
               {state.investors.map(inv => (
                 <option key={inv.id} value={inv.id}>{inv.name} ({inv.investorId})</option>
               ))}
             </select>
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
`;

fs.writeFileSync('src/pages/Bids.tsx', content);
console.log("Wrote src/pages/Bids.tsx");
