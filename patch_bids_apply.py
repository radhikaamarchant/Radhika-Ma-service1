import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_apply = '''  const handleApply = () => {
    if (!selectedInvestorId) return alert("Please select an investor");
    
    // 1% commission calculation
    const commissionAmount = amount * 0.01;
    
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      lotsApplied: lots,
      appliedAmount: amount,
      applicationDate: new Date().toISOString(),
      allotmentStatus: 'Pending',
      allottedLots: 0,
      refundStatus: 'N/A',
      listingStatus: 'N/A'
    };
    
    const newComm = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Application',
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      amount: commissionAmount,
      date: new Date().toISOString()
    };
    
    saveApplications([...applications, newApp]);
    saveCommissions([...commissions, newComm]);
    
    alert(`Application successful! ₹${amount.toLocaleString('en-IN')} deducted from Investor's Bank Account and transferred to Business Account. 1% commission (₹${commissionAmount.toFixed(2)}) charged.`);
    onClose();
  };'''

new_apply = '''  const handleApply = () => {
    if (!selectedInvestorId) return alert("Please select an investor");
    if (!selectedInvestor) return;
    
    const commissionAmount = amount * 0.01;
    const totalRequired = amount + commissionAmount;
    
    const currentBalance = getUnifiedBankBalance(
      selectedInvestor.name,
      state.businesses,
      state.investors,
      state.investments,
      state.settings
    );
    
    if (currentBalance < totalRequired) {
      alert(`Insufficient Available Balance.\\n\\nRequired: ₹${totalRequired.toLocaleString('en-IN')} (Includes 1% Platform Commission of ₹${commissionAmount.toLocaleString('en-IN')})\\nAvailable: ₹${currentBalance.toLocaleString('en-IN')}`);
      return;
    }
    
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      lotsApplied: lots,
      appliedAmount: amount,
      commissionPaid: commissionAmount,
      applicationDate: new Date().toISOString(),
      applicationStatus: 'Active',
      allotmentStatus: 'Pending',
      refundStatus: 'N/A',
      listingStatus: 'N/A'
    };
    
    const bizId = state.businesses.find((b: any) => (b.shortName?.toUpperCase() || b.name.toUpperCase()) === ipo.companyName)?.id || 'admin_business';
    
    const newComm = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Application',
      ipoId: ipo.id,
      investorId: selectedInvestorId,
      businessId: bizId,
      amount: commissionAmount,
      date: new Date().toISOString()
    };
    
    saveApplications([...applications, newApp]);
    saveCommissions([...commissions, newComm]);
    
    alert(`Application successful!\\n\\n₹${amount.toLocaleString('en-IN')} has been blocked.\\n₹${commissionAmount.toLocaleString('en-IN')} Platform Commission deducted.`);
    onClose();
  };'''

content = content.replace(old_apply, new_apply)
with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
