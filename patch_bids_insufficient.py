import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_alert = "alert(`Insufficient Available Balance.\\n\\nRequired: ₹${totalRequired.toLocaleString('en-IN')} (Includes 1% Platform Commission of ₹${commissionAmount.toLocaleString('en-IN')})\\nAvailable: ₹${currentBalance.toLocaleString('en-IN')}`);"
new_alert = "alert(`Bank ma balance nathi (Insufficient Balance).\\n\\nRequired: ₹${totalRequired.toLocaleString('en-IN')} (Includes 1% Platform Commission of ₹${commissionAmount.toLocaleString('en-IN')})\\nAvailable: ₹${currentBalance.toLocaleString('en-IN')}`);"
content = content.replace(old_alert, new_alert)

# Add Capacity Validation
capacity_validation = '''    
    if (ipo.capacity) {
      const currentAppsCount = applications.filter((a: any) => a.ipoId === ipo.id && a.applicationStatus !== 'Cancelled').length;
      if (currentAppsCount >= ipo.capacity) {
        alert("This IPO has reached its maximum capacity. You can no longer apply.");
        return;
      }
    }
'''

content = content.replace('const handleApply = () => {\n    if (!selectedInvestorId) return alert("Please select an investor");\n    if (!selectedInvestor) return;\n    ', 'const handleApply = () => {\n    if (!selectedInvestorId) return alert("Please select an investor");\n    if (!selectedInvestor) return;\n    ' + capacity_validation)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
