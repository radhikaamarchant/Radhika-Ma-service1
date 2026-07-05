import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Replace moneyStatus texts
old_status = '''                     let moneyStatus = 'Applied';
                     if (isBlocked) moneyStatus = 'Blocked in Escrow';
                     else if (isRefunded) moneyStatus = 'Refunded to Available Balance';
                     else if (isTransferred) moneyStatus = 'Transferred to Company';'''

new_status = '''                     let moneyStatus = 'Applied';
                     if (isBlocked) moneyStatus = 'Locked IPO Balance';
                     else if (isRefunded) moneyStatus = 'Refunded';
                     else if (isTransferred) moneyStatus = 'Transferred to Business Owner';'''

content = content.replace(old_status, new_status)

# Replace Blocked Amount text
old_blocked_amt = '''                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Blocked Amount</span>
                         <span className="text-kite-text font-medium">₹{isBlocked ? myApp.appliedAmount.toLocaleString('en-IN') : '0'}</span>
                       </div>'''

new_blocked_amt = '''                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Locked Amount</span>
                         <span className="text-kite-text font-medium">₹{isBlocked ? myApp.appliedAmount.toLocaleString('en-IN') : '0'}</span>
                       </div>'''

content = content.replace(old_blocked_amt, new_blocked_amt)

# Replace alerts
content = content.replace(
    'has been unblocked and returned to your Available Balance',
    'has been unlocked and returned to your Available Balance'
)

content = content.replace(
    'has been blocked.\\n₹${commissionAmount.toLocaleString(\\\'en-IN\\\')} Platform Commission deducted.',
    'has been locked in your Locked IPO Balance.\\n₹${commissionAmount.toLocaleString(\\\'en-IN\\\')} Platform Commission deducted.'
)

content = content.replace(
    'has been blocked.\\n₹${commissionAmount.toLocaleString(\'en-IN\')} Platform Commission deducted.',
    'has been locked in your Locked IPO Balance.\\n₹${commissionAmount.toLocaleString(\'en-IN\')} Platform Commission deducted.'
)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)

