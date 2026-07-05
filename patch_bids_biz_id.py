import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_save = '''      const charge = (editingIpo as any).rmasListingCharge;
      if (charge && charge > 0) {
        const newComm = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'IPO Listing',
          ipoId: newIpo.id,
          investorId: 'admin_business',
          amount: charge,
          date: new Date().toISOString()
        };
        saveCommissions([...commissions, newComm] as any);
      }'''

new_save = '''      const charge = (editingIpo as any).rmasListingCharge;
      if (charge && charge > 0) {
        const businessId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === editingIpo.companyName)?.id || 'admin_business';
        const newComm = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'IPO Listing',
          ipoId: newIpo.id,
          investorId: businessId,
          amount: charge,
          date: new Date().toISOString()
        };
        saveCommissions([...commissions, newComm] as any);
      }'''

content = content.replace(old_save, new_save)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
