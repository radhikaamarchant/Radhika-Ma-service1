import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
    if (pendingId) {
      setAddModalBusinessId(pendingId);
      setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
      setShowAddForm(true);
      setIsFromAnalysis(true);
      sessionStorage.removeItem("mobileAddInvestmentBusinessId");
    }
  }, []);`;

const replacementEffect = `  useEffect(() => {
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

code = code.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
