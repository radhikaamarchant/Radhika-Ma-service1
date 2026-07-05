import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

# For getUnifiedTransactions Admin logic:
old_admin_tx_end = '''          });
        }
      }
    });'''

new_admin_tx_end = '''          });
        }
      }
    });
    
    try {
      const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
      bidsComms.forEach((c: any) => {
         transactions.push({
           id: c.id || `tx_bids_${Math.random()}`,
           date: c.date || new Date().toISOString(),
           title: c.type === 'IPO Listing' ? 'IPO Listing Fee' : (c.type === 'Exit' ? 'Exit Commission' : 'Platform Commission'),
           description: 'From Bids Platform',
           amount: c.amount || 0,
           type: 'CREDIT',
           category: 'commission'
         });
      });
    } catch(e) {}'''
content = content.replace(old_admin_tx_end, new_admin_tx_end)

# For getUnifiedTransactions Business logic:
old_biz_tx_end = '''            category:"settlement",
          });
        }
      });
    } else if (inv) {'''

new_biz_tx_end = '''            category:"settlement",
          });
        }
      });
      
      try {
        const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
        bidsComms.forEach((c: any) => {
          if (c.type === 'IPO Listing' && c.investorId === biz.id) {
            transactions.push({
              id: c.id || `tx_bids_ipo_${Math.random()}`,
              date: c.date || new Date().toISOString(),
              title: `IPO Listing Charge`,
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
          const ipo = ipos.find((i: any) => i.id === app.ipoId);
          if (!ipo) return;
          const ipoBizId = businesses.find(b => b.shortName?.toUpperCase() === ipo.companyName || b.name.toUpperCase() === ipo.companyName)?.id;
          if (biz.id === ipoBizId) {
             if (app.allotmentStatus === 'Allotted') {
                transactions.push({
                  id: app.id || `tx_bids_app_recv_${Math.random()}`,
                  date: app.applicationDate || new Date().toISOString(),
                  title: `IPO Capital Received`,
                  description: `From Investor ID: ${app.investorId}`,
                  amount: app.appliedAmount,
                  type: "CREDIT",
                  category: "capital",
                });
             }
          }
        });
      } catch(e) {}
    } else if (inv) {'''
content = content.replace(old_biz_tx_end, new_biz_tx_end)

# For getUnifiedTransactions Investor logic:
old_inv_tx_end = '''          });
        }
      });
    }
  }
  return transactions.sort('''

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
              title: c.type === 'Exit' ? `Exit Commission` : `Platform Commission`,
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
            if (app.applicationStatus === 'Cancelled' || app.allotmentStatus === 'Not Allotted') {
              transactions.push({
                id: `tx_bids_app_ret_${Math.random()}`,
                date: new Date().toISOString(), // ideally we would store refund date but ok
                title: `IPO Application Refund`,
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
  }
  return transactions.sort('''
content = content.replace(old_inv_tx_end, new_inv_tx_end)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(content)
