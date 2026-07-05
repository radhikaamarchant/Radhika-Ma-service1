import re

with open('src/utils/bankBalance.ts', 'r') as f:
    content = f.read()

# 1. Update business bank balance to deduct IPO Listing Fee
old_biz_return_balance = '''        if (inv.status === "completed" && inv.payoutDetails) {
          const businessBurden =
            inv.payoutDetails.totalCredited +
            (inv.payoutDetails.rmasCommission || 0) +
            (inv.payoutDetails.happyIncomeTax || 0) +
            (inv.payoutDetails.rmasPrematurePenalty || 0) -
            (inv.payoutDetails.rmasSubsidyPays || 0);
          balance -= businessBurden;
        }
      } else if (invt && inv.investorId === invt.id) {'''

new_biz_return_balance = '''        if (inv.status === "completed" && inv.payoutDetails) {
          const businessBurden =
            inv.payoutDetails.totalCredited +
            (inv.payoutDetails.rmasCommission || 0) +
            (inv.payoutDetails.happyIncomeTax || 0) +
            (inv.payoutDetails.rmasPrematurePenalty || 0) -
            (inv.payoutDetails.rmasSubsidyPays || 0);
          balance -= businessBurden;
        }
      } else if (invt && inv.investorId === invt.id) {'''

# Actually, the loop for balance is over `investments`. bids_commissions is outside.
old_biz_balance_end = '''    }
  });
  
  if (isAdmin) {'''

new_biz_balance_end = '''    }
  });
  
  if (!isAdmin && businesses.some((b) => b.ownerName === entityName || b.name === entityName)) {
    const biz = businesses.find((b) => b.ownerName === entityName || b.name === entityName);
    if (biz) {
      try {
        const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
        bidsComms.forEach((c: any) => {
          if (c.type === 'IPO Listing' && c.investorId === biz.id) {
            balance -= (c.amount || 0);
          }
        });
      } catch(e) {}
    }
  }
  
  if (isAdmin) {'''

content = content.replace(old_biz_balance_end, new_biz_balance_end)

# 2. Update getUnifiedTransactions for Business
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
      } catch(e) {}
    } else if (inv) {'''

content = content.replace(old_biz_tx_end, new_biz_tx_end)

with open('src/utils/bankBalance.ts', 'w') as f:
    f.write(content)
print("Updated bankBalance for Business debit")
