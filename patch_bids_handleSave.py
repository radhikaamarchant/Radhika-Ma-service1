import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_handle_save = '''  const handleSave = () => {
    if (!editingIpo.companyName) return alert("Please select a company name");
    
    if (editingIpo.id) {
      saveIpos(ipos.map((i: any) => i.id === editingIpo.id ? { ...i, ...editingIpo } : i));
    } else {'''

new_handle_save = '''  const { dispatch } = useAppContext();
  
  const handleSave = () => {
    if (!editingIpo.companyName) return alert("Please select a company name");
    
    if (editingIpo.id) {
      const oldIpo = ipos.find((i: any) => i.id === editingIpo.id);
      saveIpos(ipos.map((i: any) => i.id === editingIpo.id ? { ...i, ...editingIpo } : i));
      
      // Automatic Allotment and Listing Logic
      if (oldIpo && oldIpo.status !== editingIpo.status) {
         let updatedApps = [...applications];
         let modifiedApps = false;
         
         if (editingIpo.status === 'Allotted' || editingIpo.status === 'Listed') {
            updatedApps = updatedApps.map((app: any) => {
              if (app.ipoId === editingIpo.id && app.applicationStatus !== 'Cancelled' && app.allotmentStatus === 'Pending') {
                 modifiedApps = true;
                 return { ...app, allotmentStatus: 'Allotted', allottedLots: app.lotsApplied };
              }
              return app;
            });
         }
         
         if (editingIpo.status === 'Closed') {
            // maybe leave them as Pending Allotment
         }
         
         if (editingIpo.status === 'Listed') {
            updatedApps = updatedApps.map((app: any) => {
               if (app.ipoId === editingIpo.id && app.allotmentStatus === 'Allotted' && app.listingStatus !== 'Listed') {
                  modifiedApps = true;
                  // Create Investment
                  const bizId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === editingIpo.companyName)?.id || 'admin_business';
                  const inv = {
                     id: `inv_ipo_${app.id}`,
                     businessId: bizId,
                     investorId: app.investorId,
                     amount: app.appliedAmount,
                     startDate: new Date().toISOString(),
                     status: 'active',
                     payoutDetails: null,
                     adminCommissionBusiness: 0,
                     adminCommissionInvestor: 0
                  };
                  // We would dispatch this but this isn't an async function, we can do it inside try/catch without await
                  dispatch({ type: 'ADD_INVESTMENT', payload: inv as any });
                  
                  return { ...app, listingStatus: 'Listed' };
               }
               return app;
            });
         }
         
         if (modifiedApps) {
            // Assuming AdminBidsView has saveApplications prop? No, it doesn't! We need to pass saveApplications to it.
         }
      }
      
    } else {'''

content = content.replace(old_handle_save, new_handle_save)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
