import re
with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "alert(`Exited successfully! 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);",
    "alert(`Exited successfully! ₹${exitAmount.toLocaleString('en-IN')} deposited to Investor Account. 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);"
)
with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
