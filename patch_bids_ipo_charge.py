import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# 1. Update AdminBidsView prop calls and signature
content = content.replace(
    'onClose={() => setIsAdminView(false)}',
    'onClose={() => setIsAdminView(false)}\n          saveCommissions={saveCommissions}'
)
content = content.replace(
    'function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {',
    'function AdminBidsView({ ipos, saveIpos, commissions, saveCommissions, applications, onClose }: any) {'
)

# 2. Add RMAS Admin Charge input
old_input_end = '          <div className="col-span-3 flex justify-end gap-2 mt-2">'
new_charge_input = '''          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">RMAS Admin Charge</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={(editingIpo as any).rmasListingCharge ? Number((editingIpo as any).rmasListingCharge).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, rmasListingCharge: raw ? parseInt(raw, 10) : ('' as any)} as any); }} />
          </div>\n'''
content = content.replace(old_input_end, new_charge_input + old_input_end)

# 3. Update handleSave to create commission record
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
        saveCommissions([...commissions, newComm] as any);
      }
    }
    setIsCreating(false);
    setEditingIpo({});
  };'''

content = content.replace(old_handle_save, new_handle_save)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
print("Updated Bids.tsx for IPO charge.")

