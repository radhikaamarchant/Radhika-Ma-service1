import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
    if (pendingId) {
      setAddModalBusinessId(pendingId);
      setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
      setShowAddForm(true);
      setIsFromAnalysis(true);
      setShowInvestorSelect(true);
      sessionStorage.removeItem("mobileAddInvestmentBusinessId");
    }
  }, []);`;

const replacementEffect = `  useEffect(() => {
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
    };
    
    checkPending();
    window.addEventListener("mobileNavigateToInvestments", checkPending);
    return () => window.removeEventListener("mobileNavigateToInvestments", checkPending);
  }, []);`;

if (code.includes(targetEffect)) {
  code = code.replace(targetEffect, replacementEffect);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found in Investments.tsx");
}
