import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

def replace_amount_input(match):
    field = match.group(1)
    return '<input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.' + field + ' ? Number(editingIpo.' + field + ').toLocaleString(\'en-IN\') : \'\'} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, \'\'); setEditingIpo({...editingIpo, ' + field + ': raw ? parseInt(raw, 10) : (\'\' as any)}); }} />'

# Extract AdminBidsView
start_idx = content.find('function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {')
end_idx = content.find('function DetailsModal({', start_idx)

if start_idx != -1 and end_idx != -1:
    admin_func = content[start_idx:end_idx]
    
    # 1. Add state from useAppContext
    admin_func = admin_func.replace(
        'const [isCreating, setIsCreating] = useState(false);',
        'const { state } = useAppContext();\n  const [isCreating, setIsCreating] = useState(false);'
    )
    
    # 2. Update handleSave to be less strict
    admin_func = admin_func.replace(
        'if (!editingIpo.companyName || !editingIpo.priceBandMin || !editingIpo.status) return alert("Fill required fields");',
        'if (!editingIpo.companyName || editingIpo.priceBandMin === undefined || !editingIpo.status) return alert("Fill required fields");'
    )
    
    # 3. Replace company name input with datalist
    admin_func = re.sub(
        r'<div>\s*<label className="block text-kite-text-light mb-1 text-\[11px\] uppercase">Company Name</label>\s*<input type="text"[^>]+>\s*</div>',
        '''<div>
            <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Company Name</label>
            <input 
              type="text" 
              list="admin-businesses-list"
              className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" 
              value={editingIpo.companyName || ''} 
              onChange={e => setEditingIpo({...editingIpo, companyName: e.target.value.toUpperCase()})} 
              placeholder="Search business..."
            />
            <datalist id="admin-businesses-list">
              {state.businesses.map(b => (
                 <option key={b.id} value={b.shortName?.toUpperCase() || b.name.toUpperCase()} />
              ))}
            </datalist>
          </div>''',
        admin_func
    )
    
    # 4. Update Number Inputs
    admin_func = re.sub(
        r'<input type="number" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value=\{editingIpo\.([^ |]+) \|\| \'\'\} onChange=\{e => setEditingIpo\(\{\.\.\.editingIpo, \1: Number\(e\.target\.value\)\}\)\} />',
        replace_amount_input,
        admin_func
    )
    
    new_content = content[:start_idx] + admin_func + content[end_idx:]
    with open('src/pages/Bids.tsx', 'w') as f:
        f.write(new_content)
    print("Admin form updated via Python.")
else:
    print("Could not find blocks")
