import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Update IPO interface
old_ipo_status = r"status: 'Upcoming' \| 'Open' \| 'Closed' \| 'Allotted' \| 'Listed';"
new_ipo_status = "status: 'Upcoming' | 'Open' | 'Closed' | 'Pending Allotment' | 'Allotted' | 'Not Allotted' | 'Listed';"
content = re.sub(old_ipo_status, new_ipo_status, content)

# Update dropdown
old_dropdown = '''              <option value="Upcoming">Upcoming</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Allotted">Allotted</option>
              <option value="Listed">Listed</option>'''

new_dropdown = '''              <option value="Upcoming">Upcoming</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending Allotment">Pending Allotment</option>
              <option value="Allotted">Allotted</option>
              <option value="Not Allotted">Not Allotted</option>
              <option value="Listed">Listed</option>'''
content = content.replace(old_dropdown, new_dropdown)

# Update handleSave for Allotment logic
old_handle_save = '''         if (editingIpo.status === 'Allotted' || editingIpo.status === 'Listed') {
            updatedApps = updatedApps.map((app: any) => {
              if (app.ipoId === editingIpo.id && app.applicationStatus !== 'Cancelled' && app.allotmentStatus === 'Pending') {
                 modifiedApps = true;
                 return { ...app, allotmentStatus: 'Allotted', allottedLots: app.lotsApplied };
              }
              return app;
            });
         }
         
         if (editingIpo.status === 'Closed') {
            // maybe leave them as Pending Allotment
         }'''

new_handle_save = '''         if (editingIpo.status === 'Allotted' || editingIpo.status === 'Listed') {
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
         }'''
content = content.replace(old_handle_save, new_handle_save)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)

