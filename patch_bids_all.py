import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

kite_dropdown = """
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
"""

if "function KiteDropdown" not in content:
    idx = content.find("export default function Bids")
    content = content[:idx] + kite_dropdown + "\n" + content[idx:]

# 1. Fix AdminBidsView Company Name Input
# We already changed it to datalist earlier. Let's find and replace it with KiteDropdown.
old_admin_company = """<div><label className="block text-kite-text-light mb-1 text-[11px] uppercase">Company Name</label><input type="text" list="admin-businesses-list" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.companyName || ''} onChange={e => setEditingIpo({...editingIpo, companyName: e.target.value.toUpperCase()})} placeholder="Search business..." /><datalist id="admin-businesses-list">{state.businesses.map((b: any) => (<option key={b.id} value={b.shortName?.toUpperCase() || b.name.toUpperCase()} />))}</datalist></div>"""

new_admin_company = """<KiteDropdown 
  label="Company Name" 
  placeholder="Search business..."
  value={editingIpo.companyName || ''}
  onChange={(val: string) => setEditingIpo({...editingIpo, companyName: val})}
  options={state.businesses.map((b: any) => ({ value: b.shortName?.toUpperCase() || b.name.toUpperCase(), label: b.name }))}
/>"""

content = content.replace(old_admin_company, new_admin_company)

# 2. Fix ApplyModal Investor Select
old_investor_select = """<label className="block text-[11px] text-kite-text-light uppercase tracking-wide mb-2">Select Investor Profile</label>
             <select 
               value={selectedInvestorId} 
               onChange={e => setSelectedInvestorId(e.target.value)}
               className="w-full border border-kite-border-soft bg-transparent rounded-sm p-2 text-kite-text outline-none focus:border-kite-blue"
             >
               <option value="">-- Choose Investor --</option>
               {state.investors.map(inv => (
                 <option key={inv.id} value={inv.id}>{inv.name} ({inv.investorId})</option>
               ))}
             </select>"""

new_investor_select = """<KiteDropdown 
  label="Select Investor Profile" 
  placeholder="Search investor..."
  value={selectedInvestorId}
  onChange={setSelectedInvestorId}
  options={state.investors.map((inv: any) => ({ value: inv.id, label: `${inv.name} (${inv.investorId})` }))}
/>"""

# Regex for investor select replacement
content = re.sub(
    r'<label className="block text-\[11px\] text-kite-text-light uppercase tracking-wide mb-2">Select Investor Profile</label>\s*<select[\s\S]*?</select>',
    new_investor_select,
    content
)

# 3. Update ApplyModal alert to mention bank transfer
old_alert = "alert(`Application successful! 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);"
new_alert = "alert(`Application successful! ₹${amount.toLocaleString('en-IN')} deducted from Investor's Bank Account and transferred to Business Account. 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);"
content = content.replace(old_alert, new_alert)


# 4. DetailsModal: change myApp logic to myApps array and remove !myApp from apply button
old_details_start = """const myApp = applications?.find((a: any) => a.ipoId === ipo.id);"""
new_details_start = """const myApps = applications?.filter((a: any) => a.ipoId === ipo.id) || [];"""
content = content.replace(old_details_start, new_details_start)

# Replace the single myApp rendering with a loop
# Regex to find the {myApp && ( ... )} block
details_myapp_regex = r'\{myApp && \(\s*<div>\s*<h3 className="text-\[14px\] font-medium text-kite-text mb-4">My Application</h3>[\s\S]*?</div>\s*\)\}'

new_details_myapp = """
             {myApps.length > 0 && (
               <div>
                 <h3 className="text-[14px] font-medium text-kite-text mb-4">Applications ({myApps.length})</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                   {myApps.map((myApp: any) => (
                     <div key={myApp.id} className="bg-blue-50/50 dark:bg-blue-900/5 border border-kite-border-soft p-4 rounded space-y-3">
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Application Date</span>
                         <span className="text-kite-text">{new Date(myApp.applicationDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Lots Applied</span>
                         <span className="text-kite-text">{myApp.lotsApplied} (₹{myApp.appliedAmount.toLocaleString('en-IN')})</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Allotment Status</span>
                         <span className="text-kite-text font-medium">{myApp.allotmentStatus}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Listing Status</span>
                         <span className="text-kite-text font-medium">{myApp.listingStatus}</span>
                       </div>
                       {myApp.listingStatus !== 'Exited' && (
                          <button 
                             onClick={() => {
                              const exitAmount = myApp.appliedAmount;
                              const commissionAmount = exitAmount * 0.01;
                              
                              const newApps = applications.map((a: any) => a.id === myApp.id ? { ...a, listingStatus: 'Exited' } : a);
                              saveApplications(newApps as any);
                              
                              const newComm = {
                                id: Math.random().toString(36).substr(2, 9),
                                type: 'Exit',
                                ipoId: ipo.id,
                                investorId: myApp.investorId,
                                amount: commissionAmount,
                                date: new Date().toISOString()
                              };
                              saveCommissions([...commissions, newComm] as any);
                              alert(`Exited successfully! ₹${exitAmount.toLocaleString('en-IN')} deposited to Investor Account. 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);
                            }} 
                             className="w-full mt-2 bg-kite-red text-white px-3 py-2 rounded-sm text-[12px] hover:bg-red-600 transition-colors"
                          >
                            Exit / Sell / Unapply
                          </button>
                        )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
"""
content = re.sub(details_myapp_regex, new_details_myapp, content)

# Remove !myApp from apply button condition
content = content.replace(
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && !myApp && (",
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && ("
)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")

