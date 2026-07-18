const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

const target = `  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !formData.investorId) {
      alert("Please select both a business and an investor.");
      return;
    }

    const amount = getRawAmount(formData.amount);
    if (amount <= 0) return;

    const comms = calculateCommissions();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(formData.timePeriodMonths));

    const newInvestment: Investment = {
      id: \`inv\${Date.now()}\`,
      businessId: formData.businessId,
      investorId: formData.investorId,
      amount: amount,
      quantity: formData.quantity,
      timePeriodMonths: parseInt(formData.timePeriodMonths),
      interestRate: parseFloat(expectedRoi) || selectedBusiness.interestRate,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      adminCommissionInvestor: comms.fromInvestor,
      adminCommissionBusiness: comms.fromBusiness,
      status: "active",
    };

    setIsBooking(true);
    setTimeout(() => {
      dispatch({ type: "ADD_INVESTMENT", payload: newInvestment });`;

const replacement = `  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || formData.investorIds.length === 0) {
      alert("Please select both a business and at least one investor.");
      return;
    }

    const amount = getRawAmount(formData.amount);
    if (amount <= 0) return;

    const comms = calculateCommissions();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(formData.timePeriodMonths));

    setIsBooking(true);
    setTimeout(() => {
      formData.investorIds.forEach((invId, idx) => {
        const newInvestment: Investment = {
          id: \`inv\${Date.now()}_\${idx}\`,
          businessId: formData.businessId,
          investorId: invId,
          amount: amount,
          quantity: formData.quantity,
          timePeriodMonths: parseInt(formData.timePeriodMonths),
          interestRate: parseFloat(expectedRoi) || selectedBusiness.interestRate,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          adminCommissionInvestor: comms.fromInvestor,
          adminCommissionBusiness: comms.fromBusiness,
          status: "active",
        };
        dispatch({ type: "ADD_INVESTMENT", payload: newInvestment });
      });`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Target not found');
}
