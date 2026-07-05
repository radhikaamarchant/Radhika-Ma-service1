import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Fix AdminBidsView to save a commission when a NEW IPO is created with rmasListingCharge
# First, let's look at `handleSave` inside `AdminBidsView`
start_idx = content.find('function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {')
end_idx = content.find('function DetailsModal({', start_idx)

admin_func = content[start_idx:end_idx]

# We need to add the input field for rmasListingCharge
new_charge_input = '''          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">RMAS Admin Charge</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={(editingIpo as any).rmasListingCharge ? Number((editingIpo as any).rmasListingCharge).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, rmasListingCharge: raw ? parseInt(raw, 10) : ('' as any)} as any); }} />
          </div>'''

admin_func = admin_func.replace('          <div className="col-span-3 flex justify-end gap-2 mt-2">', new_charge_input + '\n          <div className="col-span-3 flex justify-end gap-2 mt-2">')

# Modify handleSave
old_handle_save = '''  const handleSave = () => {
    if (!editingIpo.companyName) return alert("Please select a company name");
    
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
  };'''

new_handle_save = '''  const handleSave = () => {
    if (!editingIpo.companyName) return alert("Please select a company name");
    
    if (editingIpo.id) {
      saveIpos(ipos.map((i: any) => i.id === editingIpo.id ? { ...i, ...editingIpo } : i));
    } else {
      const newIpo = {
        ...editingIpo,
        id: Math.random().toString(36).substr(2, 9),
      } as IPO;
      saveIpos([...ipos, newIpo]);
      
      const charge = (editingIpo as any).rmasListingCharge;
      if (charge && charge > 0) {
        const newComm = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'IPO Listing',
          ipoId: newIpo.id,
          investorId: 'admin_business',
          amount: charge,
          date: new Date().toISOString()
        };
        // Needs a way to saveCommissions in AdminBidsView... wait AdminBidsView gets commissions but not saveCommissions!
      }
    }
    setIsCreating(false);
    setEditingIpo({});
  };'''

# Wait, does AdminBidsView have `saveCommissions`? No!
# `function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any)`
# We need to pass saveCommissions to it.
