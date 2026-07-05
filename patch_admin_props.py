import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_admin = '''        <AdminBidsView 
          ipos={ipos} 
          saveIpos={saveIpos} 
          commissions={commissions} 
          applications={applications}
          onClose={() => setIsAdminView(false)}
        />'''

new_admin = '''        <AdminBidsView 
          ipos={ipos} 
          saveIpos={saveIpos} 
          commissions={commissions}
          saveCommissions={saveCommissions}
          applications={applications}
          saveApplications={saveApplications}
          onClose={() => setIsAdminView(false)}
        />'''

content = content.replace(old_admin, new_admin)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
