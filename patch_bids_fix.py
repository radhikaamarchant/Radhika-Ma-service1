import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Fix DetailsModal usage
old_details = r'<DetailsModal ipo=\{selectedIpo\} onClose=\{[^}]+\} onApply=\{[^}]+\} applications=\{applications\}\s*'
new_details = '''<DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} applications={applications} saveApplications={saveApplications} commissions={commissions} saveCommissions={saveCommissions} />
      )}
      '''
content = re.sub(old_details, new_details, content)

# Fix ApplyModal usage
old_apply = r'<ApplyModal\s*ipo=\{selectedIpo\}\s*onClose=\{[^}]+\}\s*applications=\{applications\}\s*commissions=\{commissions\}\s*saveCommissions=\{saveCommissions\}\s*/>'
new_apply = '''<ApplyModal 
          ipo={selectedIpo} 
          onClose={() => setIsApplyOpen(false)} 
          applications={applications}
          saveApplications={saveApplications}
          commissions={commissions}
          saveCommissions={saveCommissions}
        />'''
content = re.sub(old_apply, new_apply, content)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
