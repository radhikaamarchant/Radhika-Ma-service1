import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {')
end_idx = content.find('function DetailsModal({', start_idx)

if start_idx != -1 and end_idx != -1:
    admin_func = content[start_idx:end_idx]
    
    new_company_div = '<div><label className="block text-kite-text-light mb-1 text-[11px] uppercase">Company Name</label><input type="text" list="admin-businesses-list" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.companyName || \'\'} onChange={e => setEditingIpo({...editingIpo, companyName: e.target.value.toUpperCase()})} placeholder="Search business..." /><datalist id="admin-businesses-list">{state.businesses.map((b: any) => (<option key={b.id} value={b.shortName?.toUpperCase() || b.name.toUpperCase()} />))}</datalist></div>'
    
    admin_func = re.sub(
        r'<div>\s*<label[^>]*>Company Name</label>\s*<input type="text".*?companyName.*?/>\s*</div>',
        new_company_div,
        admin_func,
        flags=re.DOTALL
    )
    
    new_content = content[:start_idx] + admin_func + content[end_idx:]
    with open('src/pages/Bids.tsx', 'w') as f:
        f.write(new_content)
    print("Admin form updated via Python 3.")
else:
    print("Could not find blocks")
