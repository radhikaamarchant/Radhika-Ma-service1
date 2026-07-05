import re

with open('src/pages/AdminPage.tsx', 'r') as f:
    content = f.read()

old_brokerage_calc = '''    let brokerage = 0;
    let hpgTax = 0;
    
    state.investments.forEach(inv => {
      investmentsCommission += (inv.adminCommissionBusiness || 0) + (inv.adminCommissionInvestor || 0);
      
      if (inv.status === "completed" && inv.payoutDetails) {
        authorities += (inv.payoutDetails.rmasSubsidyPays || 0);
        brokerage += (inv.payoutDetails.rmasCommission || 0);
        hpgTax += (inv.payoutDetails.happyIncomeTax || 0);
      }
    });'''

new_brokerage_calc = '''    let brokerage = 0;
    let hpgTax = 0;
    
    state.investments.forEach(inv => {
      investmentsCommission += (inv.adminCommissionBusiness || 0) + (inv.adminCommissionInvestor || 0);
      
      if (inv.status === "completed" && inv.payoutDetails) {
        authorities += (inv.payoutDetails.rmasSubsidyPays || 0);
        brokerage += (inv.payoutDetails.rmasCommission || 0);
        hpgTax += (inv.payoutDetails.happyIncomeTax || 0);
      }
    });
    
    try {
      const bidsComms = JSON.parse(localStorage.getItem("bids_commissions") || "[]");
      bidsComms.forEach((c: any) => {
         brokerage += (c.amount || 0);
      });
    } catch(e) {}'''

content = content.replace(old_brokerage_calc, new_brokerage_calc)

# We might also need to find the old exact text, just in case spaces are different
if new_brokerage_calc not in content:
    content = re.sub(
        r'let brokerage = 0;\s*let hpgTax = 0;\s*state\.investments\.forEach\(inv => \{[\s\S]*?\}\);',
        new_brokerage_calc,
        content
    )

with open('src/pages/AdminPage.tsx', 'w') as f:
    f.write(content)
print("Updated AdminPage.tsx")

