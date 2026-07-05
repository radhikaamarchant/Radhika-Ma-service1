import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

# Add to getUnifiedBankBalance
old_biz_return_balance = '''        }
      } catch(e) {}
    }
  }
  
  if (isAdmin) {'''

new_biz_return_balance = '''        }
      } catch(e) {}
    }
  }
  
  // Now add Bids Applications logic
  try {
    const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
    const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
    
    bidsApps.forEach((app: any) => {
      const ipo = ipos.find((i: any) => i.id === app.ipoId);
      if (!ipo) return;
      
      const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
      const isAppInvestor = investors.find((i) => i.name === entityName)?.id === app.investorId;
      const isAppBusiness = businesses.find((b) => b.ownerName === entityName || b.name === entityName)?.id === ipoBizId;
      
      if (isAdmin) {
         // Admin doesn't get the capital, it goes to business. But admin might have invested? We won't worry about admin investor right now unless entity matches
      } else if (isAppInvestor) {
         balance -= app.appliedAmount; // Debited from Investor
         if (app.listingStatus === 'Exited') {
           balance += app.appliedAmount; // Returned to investor
         }
      } else if (isAppBusiness) {
         balance += app.appliedAmount; // Credited to Business
         if (app.listingStatus === 'Exited') {
           balance -= app.appliedAmount; // Refunded
         }
      }
    });
  } catch(e) {}
  
  if (isAdmin) {'''
content = content.replace(old_biz_return_balance, new_biz_return_balance)

# Add to getUnifiedTransactions
old_biz_tx_end = '''      } catch(e) {}
    } else if (inv) {'''

new_biz_tx_end = '''      } catch(e) {}
      
      try {
        const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
        const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
        bidsApps.forEach((app: any) => {
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
        });
      } catch(e) {}
    } else if (inv) {'''
content = content.replace(old_biz_tx_end, new_biz_tx_end)

old_inv_tx_end = '''          });
        }
      });
    }
  }'''

new_inv_tx_end = '''          });
        }
      });
      
      try {
        const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
        bidsComms.forEach((c: any) => {
          if (c.investorId === inv.id && c.type !== 'IPO Listing') {
            transactions.push({
              id: c.id || `tx_bids_comm_${Math.random()}`,
              date: c.date || new Date().toISOString(),
              title: c.type === 'Exit' ? `Exit Commission` : `Application Commission`,
              description: `Paid to RMAS`,
              amount: c.amount || 0,
              type: "DEBIT",
              category: "fee",
            });
          }
        });
        const bidsApps = JSON.parse(localStorage.getItem("bids_applications") || "[]");
        const ipos = JSON.parse(localStorage.getItem("bids_ipos") || "[]");
        bidsApps.forEach((app: any) => {
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
        });
      } catch(e) {}
    }
  }'''
content = content.replace(old_inv_tx_end, new_inv_tx_end)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(content)
print("Updated bankBalance for IPO Applications")
