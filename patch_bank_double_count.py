import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

# For Business
old_biz = '''            // Business only gets money if Allotted or Listed
            if (app.allotmentStatus === 'Allotted') {
                transactions.push({'''

new_biz = '''            // Business only gets money if Allotted, but NOT if Listed (because Investment takes over)
            if (app.allotmentStatus === 'Allotted' && app.listingStatus !== 'Listed') {
                transactions.push({'''

content = content.replace(old_biz, new_biz)

# For Investor
old_inv = '''        bidsApps.forEach((app: any) => {
          if (app.investorId === inv.id) {
            const ipo = ipos.find((i: any) => i.id === app.ipoId);
            // Always deduct when applied
            transactions.push({'''

new_inv = '''        bidsApps.forEach((app: any) => {
          if (app.investorId === inv.id) {
            const ipo = ipos.find((i: any) => i.id === app.ipoId);
            // Always deduct when applied, but if Listed, the Investment takes over
            if (app.listingStatus !== 'Listed') {
                transactions.push({
                  id: app.id || `tx_bids_app_inv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `Locked IPO Balance`,
                  description: `For ${ipo?.companyName || 'Unknown IPO'}`,
                  amount: app.appliedAmount,
                  type: "DEBIT",
                  category: "investment",
                });
            }
            
            // If Refunded, credit it back (Wait, if it's refunded it was never listed anyway, but just to be safe)
            if (app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted') {
                transactions.push({
                  id: app.id + "_refund" || `tx_bids_app_ret_${Math.random()}`,
                  date: new Date().toISOString(),
                  title: `IPO Refund`,
                  description: `From ${ipo?.companyName || 'Unknown IPO'}`,
                  amount: app.appliedAmount,
                  type: "CREDIT",
                  category: "settlement",
                });
                
                // wait! if we skip the DEBIT because of Listed, we shouldn't have Refund anyway. But if Refunded, we must have Debited.
                // Since Refunded means it's NOT Listed, the DEBIT happened above. So we must Credit back here.
            }
            // we remove the push from old_inv and replace it carefully. Let's do it via python correctly.
'''

with open('src/utils/bankBalance.ts', 'r') as f:
    content2 = f.read()

# Let's do string replacements directly
biz_repl = content2.replace('''            // Business only gets money if Allotted or Listed
            if (app.allotmentStatus === 'Allotted') {''', '''            // Business only gets money if Allotted, but NOT if Listed (because Investment takes over)
            if (app.allotmentStatus === 'Allotted' && app.listingStatus !== 'Listed') {''')

inv_search = '''            // Always deduct when applied
            transactions.push({
              id: app.id || `tx_bids_app_inv_${Math.random()}`,
              date: app.applicationDate || new Date().toISOString(),
              title: `Locked IPO Balance`,
              description: `For ${ipo?.companyName || 'Unknown IPO'}`,
              amount: app.appliedAmount,
              type: "DEBIT",
              category: "investment",
            });'''

inv_repl = '''            // Always deduct when applied, unless Listed
            if (app.listingStatus !== 'Listed') {
                transactions.push({
                  id: app.id || `tx_bids_app_inv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `Locked IPO Balance`,
                  description: `For ${ipo?.companyName || 'Unknown IPO'}`,
                  amount: app.appliedAmount,
                  type: "DEBIT",
                  category: "investment",
                });
            }'''

biz_repl = biz_repl.replace(inv_search, inv_repl)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(biz_repl)

