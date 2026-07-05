import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Add Capacity to UI
capacity_ui = '''          <div>
             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Select Capacity</label>
             <input type="text" className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.capacity ? Number(editingIpo.capacity).toLocaleString('en-IN') : ''} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); setEditingIpo({...editingIpo, capacity: raw ? parseInt(raw, 10) : undefined}); }} placeholder="e.g. 200" />
          </div>'''

content = content.replace('          <div>\n             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Min</label>', capacity_ui + '\n          <div>\n             <label className="block text-kite-text-light mb-1 text-[11px] uppercase">Price Band Min</label>')

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)

