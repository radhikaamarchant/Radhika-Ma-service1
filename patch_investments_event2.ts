import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const checkPending = () => {
      const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
      if (pendingId) {
        setAddModalBusinessId(pendingId);
        setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
        setShowAddForm(true);
        setIsFromAnalysis(true);
        // setShowInvestorSelect(false); // Make sure it's false to show the new investment form directly
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
      }
    };`;

const replacementEffect = `  useEffect(() => {
    const checkPending = () => {
      const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
      if (pendingId) {
        setAddModalBusinessId(pendingId);
        setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
        setShowAddForm(true);
        setIsFromAnalysis(true);
        setShowInvestorSelect(false); // Make sure it's false to show the new investment form directly
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
      }
    };`;

if (code.includes(targetEffect)) {
  code = code.replace(targetEffect, replacementEffect);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log("Success");
} else {
  // Wait, did I leave the old version? Let's check what's actually there.
  console.log("Not found, trying alternative.");
}
