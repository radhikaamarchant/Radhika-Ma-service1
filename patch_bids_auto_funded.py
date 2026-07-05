import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Pass ipos and saveIpos to ApplyModal
old_apply_usage = '''        <ApplyModal 
          ipo={selectedIpo} 
          onClose={() => setIsApplyOpen(false)} 
          applications={applications}
          saveApplications={saveApplications}
          commissions={commissions}
          saveCommissions={saveCommissions}
        />'''
new_apply_usage = '''        <ApplyModal 
          ipo={selectedIpo} 
          ipos={ipos}
          saveIpos={saveIpos}
          onClose={() => setIsApplyOpen(false)} 
          applications={applications}
          saveApplications={saveApplications}
          commissions={commissions}
          saveCommissions={saveCommissions}
        />'''
content = content.replace(old_apply_usage, new_apply_usage)

# Update ApplyModal definition
old_apply_def = "function ApplyModal({ ipo, onClose, applications, saveApplications, commissions, saveCommissions }: any) {"
new_apply_def = "function ApplyModal({ ipo, ipos, saveIpos, onClose, applications, saveApplications, commissions, saveCommissions }: any) {"
content = content.replace(old_apply_def, new_apply_def)

# Update handleApply logic to auto-fund
old_handle_apply_success = "alert(`Application successful!\\n\\n₹${amount.toLocaleString('en-IN')} has been locked in your Locked IPO Balance.\\n₹${commissionAmount.toLocaleString('en-IN')} Platform Commission deducted.`);\n    onClose();"
new_handle_apply_success = '''
    if (ipo.capacity && ipos && saveIpos) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length + 1;
      if (currentAppsCount >= ipo.capacity) {
         const updatedIpos = ipos.map((i: any) => i.id === ipo.id ? { ...i, status: 'Funded' } : i);
         saveIpos(updatedIpos);
      }
    }

    alert(`Application successful!\\n\\n₹${amount.toLocaleString('en-IN')} has been locked in your Locked IPO Balance.\\n₹${commissionAmount.toLocaleString('en-IN')} Platform Commission deducted.`);
    onClose();'''
content = content.replace(old_handle_apply_success, new_handle_apply_success)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)

