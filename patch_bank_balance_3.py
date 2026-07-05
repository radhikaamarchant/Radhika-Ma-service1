import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

# Update getUnifiedBankBalance
old_return = '''    }
  });
  return balance;
}'''

new_return = '''    }
  });

  // BIDS APPLICATIONS LOGIC
  try {
    const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
    const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
    const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
    
    if (isAdmin) {
      bidsComms.forEach((c: any) => {
         balance += (c.amount || 0);
      });
    } else {
      const biz = businesses.find((b) => b.ownerName === entityName || b.name === entityName);
      const invt = investors.find((i) => i.name === entityName);
      
      if (biz) {
        // Business logic
        bidsComms.forEach((c: any) => {
          if (c.type === 'IPO Listing' && c.investorId === biz.id) {
            balance -= (c.amount || 0);
          }
        });
        bidsApps.forEach((app: any) => {
          const ipo = ipos.find((i: any) => i.id === app.ipoId);
          if (!ipo) return;
          const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
          if (biz.id === ipoBizId) {
             if (app.allotmentStatus === 'Allotted') {
               balance += app.appliedAmount; // Business gets the capital ONLY when allotted
             }
          }
        });
      } else if (invt) {
        // Investor logic
        bidsApps.forEach((app: any) => {
          if (app.investorId === invt.id) {
             if (app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted') {
               // Refunded completely, no effect on balance (since we deduct it first, we need to handle it)
               // Wait, the money is deducted from balance right away upon application.
               // So:
               balance -= app.appliedAmount; // deducted when applied
               if (app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted') {
                 balance += app.appliedAmount; // refunded
               }
             } else {
               balance -= app.appliedAmount; // currently applied or allotted (in both cases, money is gone from available balance)
             }
          }
        });
        
        bidsComms.forEach((c: any) => {
          if (c.investorId === invt.id && c.type !== 'IPO Listing') {
            balance -= (c.amount || 0); // Commission paid by investor
          }
        });
      }
    }
  } catch(e) {}

  return balance;
}'''

content = content.replace(old_return, new_return)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(content)
