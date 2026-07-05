import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Update IPO status type if needed
old_ipo_status = "status: 'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming' | 'Not Allotted' | 'Pending Allotment';"
# It's already mostly there from my previous patch. Let's just override the Dropdown and Tabs.

# Update Dropdown options
old_dropdown = '''            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Listed'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Listed">Listed</option>
              <option value="Allotted">Allotted</option>
              <option value="Funded">Funded</option>
              <option value="Closed">Closed</option>
            </select>'''

new_dropdown = '''            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Listed'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Listed">Listed</option>
              <option value="Funded">Funded</option>
              <option value="Allotted">Allotted</option>
              <option value="Closed">Closed</option>
            </select>'''
content = content.replace(old_dropdown, new_dropdown)

# Update apply condition
old_apply_cond = "{(ipo.status === 'Open' || ipo.status === 'Upcoming' || ipo.status === 'Listed') && ("
new_apply_cond = "{(ipo.status === 'Listed') && ("
content = content.replace(old_apply_cond, new_apply_cond)

# Update the auto-Funded logic in handleApply
old_handle_apply_success = '''    if (ipo.capacity && ipos && saveIpos) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length + 1;
      if (currentAppsCount >= ipo.capacity) {
         const updatedIpos = ipos.map((i: any) => i.id === ipo.id ? { ...i, status: 'Funded' } : i);
         saveIpos(updatedIpos);
      }
    }'''

new_handle_apply_success = '''    if (ipo.capacity && ipos && saveIpos) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length + 1;
      if (currentAppsCount >= ipo.capacity) {
         const updatedIpos = ipos.map((i: any) => i.id === ipo.id ? { ...i, status: 'Funded' } : i);
         saveIpos(updatedIpos);
         // Also update local state
         setIpos(updatedIpos);
      }
    }'''
content = content.replace(old_handle_apply_success, new_handle_apply_success)

# Fix the tabs inside the component
# I previously set: useState<'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming'>('Listed');
old_tabs_render = "(['Listed', 'Funded', 'Allotted', 'Closed', 'Open', 'Upcoming'] as const).map(tab =>"
new_tabs_render = "(['Listed', 'Funded', 'Allotted', 'Closed'] as const).map(tab =>"
content = content.replace(old_tabs_render, new_tabs_render)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
