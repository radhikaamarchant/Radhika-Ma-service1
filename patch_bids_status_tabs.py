import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Update IPO status type
old_ipo_type = "status: 'Upcoming' | 'Open' | 'Closed' | 'Pending Allotment' | 'Allotted' | 'Not Allotted' | 'Listed';"
new_ipo_type = "status: 'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming' | 'Not Allotted' | 'Pending Allotment';"
content = content.replace(old_ipo_type, new_ipo_type)
if 'capacity?: number;' not in content:
    content = content.replace('  timeline: {', '  capacity?: number;\n  timeline: {')

# Update Bids activeTab state
old_active_tab = "useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed'>('Open');"
new_active_tab = "useState<'Listed' | 'Funded' | 'Allotted' | 'Closed' | 'Open' | 'Upcoming'>('Listed');"
content = content.replace(old_active_tab, new_active_tab)

# Update Bids tabs rendering
old_tabs_render = "(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed'] as const).map(tab =>"
new_tabs_render = "(['Listed', 'Funded', 'Allotted', 'Closed', 'Open', 'Upcoming'] as const).map(tab =>"
content = content.replace(old_tabs_render, new_tabs_render)

# Update AdminBidsView Status select
old_select = '''            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Upcoming'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Upcoming">Upcoming</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending Allotment">Pending Allotment</option>
              <option value="Allotted">Allotted</option>
              <option value="Not Allotted">Not Allotted</option>
              <option value="Listed">Listed</option>
            </select>'''

new_select = '''            <select className="w-full border border-kite-border-soft rounded-sm p-1.5 bg-transparent" value={editingIpo.status || 'Listed'} onChange={e => setEditingIpo({...editingIpo, status: e.target.value as any})}>
              <option value="Listed">Listed</option>
              <option value="Allotted">Allotted</option>
              <option value="Funded">Funded</option>
              <option value="Closed">Closed</option>
            </select>'''
content = content.replace(old_select, new_select)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
