import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('{isAdminView ? (')
end_idx = content.find(') : (', start_idx)

if start_idx != -1 and end_idx != -1:
    new_admin = '''{isAdminView ? (
        <AdminBidsView 
          ipos={ipos} 
          saveIpos={saveIpos} 
          commissions={commissions}
          saveCommissions={saveCommissions}
          applications={applications}
          saveApplications={saveApplications}
          onClose={() => setIsAdminView(false)}
        />
      '''
    content = content[:start_idx] + new_admin + content[end_idx:]

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
