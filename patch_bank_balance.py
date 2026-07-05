import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

business_bids_logic_old = '''        bidsApps.forEach((app: any) => {
          const ipo = ipos.find((i: any) => i.id === app.ipoId);
          if (!ipo) return;
          const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
          if (biz.id === ipoBizId) {
            transactions.push({
              id: app.id || `tx_bids_app_recv_${Math.random()}`,
              date: app.applicationDate || new Date().toISOString(),
              title: `IPO Capital Received`,
              description: `From Investor ID: ${app.investorId}`,
              amount: app.appliedAmount,
              type: "CREDIT",
              category: "capital",
            });
            if (app.listingStatus === 'Exited') {
              transactions.push({
                id: `tx_bids_app_ref_${Math.random()}`,
                date: new Date().toISOString(),
                title: `IPO Capital Returned (Exit)`,
                description: `To Investor ID: ${app.investorId}`,
                amount: app.appliedAmount,
                type: "DEBIT",
                category: "settlement",
              });
            }
          }
        });'''

business_bids_logic_new = '''        bidsApps.forEach((app: any) => {
          const ipo = ipos.find((i: any) => i.id === app.ipoId);
          if (!ipo) return;
          const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
          if (biz.id === ipoBizId) {
            // Business only gets money if Allotted or Listed
            if (app.allotmentStatus === 'Allotted') {
                transactions.push({
                  id: app.id + "_recv" || `tx_bids_app_recv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `IPO Capital Received`,
                  description: `From Investor ID: ${app.investorId}`,
                  amount: app.appliedAmount,
                  type: "CREDIT",
                  category: "capital",
                });
            }
          }
        });'''
content = content.replace(business_bids_logic_old, business_bids_logic_new)


investor_bids_logic_old = '''        bidsApps.forEach((app: any) => {
          if (app.investorId === inv.id) {
            const ipo = ipos.find((i: any) => i.id === app.ipoId);
            transactions.push({
              id: app.id || `tx_bids_app_inv_${Math.random()}`,
              date: app.applicationDate || new Date().toISOString(),
              title: `IPO Application`,
              description: `In ${ipo?.companyName || 'Unknown IPO'}`,
              amount: app.appliedAmount,
              type: "DEBIT",
              category: "investment",
            });
            if (app.listingStatus === 'Exited') {
              transactions.push({
                id: `tx_bids_app_ret_${Math.random()}`,
                date: new Date().toISOString(),
                title: `IPO Exit Returned`,
                description: `From ${ipo?.companyName || 'Unknown IPO'}`,
                amount: app.appliedAmount,
                type: "CREDIT",
                category: "settlement",
              });
            }
          }
        });'''

investor_bids_logic_new = '''        bidsApps.forEach((app: any) => {
          if (app.investorId === inv.id) {
            const ipo = ipos.find((i: any) => i.id === app.ipoId);
            // Always deduct when applied
            transactions.push({
              id: app.id || `tx_bids_app_inv_${Math.random()}`,
              date: app.applicationDate || new Date().toISOString(),
              title: `Locked IPO Balance`,
              description: `For ${ipo?.companyName || 'Unknown IPO'}`,
              amount: app.appliedAmount,
              type: "DEBIT",
              category: "investment",
            });
            
            // If Refunded, credit it back
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
            }
            // If Exited (we only show it in Investents page but here as well for sync)
            else if (app.listingStatus === 'Exited') {
              // Not sure if Exited applies to IPO apps in Bids, but let's keep it safe.
              // We removed Exit in favor of standard holding selling, but leaving it if it's there.
            }
          }
        });'''
content = content.replace(investor_bids_logic_old, investor_bids_logic_new)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(content)

