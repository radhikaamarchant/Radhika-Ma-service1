import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// Replace showAddForm
code = code.replace(
  '  const [showAddForm, setShowAddForm] = useState(false);',
  '  const [showAddForm, setShowAddForm] = useState(() => !!sessionStorage.getItem("mobileAddInvestmentBusinessId"));'
);

code = code.replace(
  '  const [addModalBusinessId, setAddModalBusinessId] = useState("");',
  '  const [addModalBusinessId, setAddModalBusinessId] = useState(() => sessionStorage.getItem("mobileAddInvestmentBusinessId") || "");'
);

code = code.replace(
  '  const [isFromAnalysis, setIsFromAnalysis] = useState(false);',
  '  const [isFromAnalysis, setIsFromAnalysis] = useState(() => !!sessionStorage.getItem("mobileAddInvestmentBusinessId"));'
);

const formDataInitOld = `  const [formData, setFormData] = useState({
    businessId:"",
    investorId:"",
    amount:"",
    timePeriodMonths:"12",
    adminCommissionInvestorPct:"2",
    adminCommissionBusinessPct:"2",
  });`;

const formDataInitNew = `  const [formData, setFormData] = useState(() => ({
    businessId: sessionStorage.getItem("mobileAddInvestmentBusinessId") || "",
    investorId:"",
    amount:"",
    timePeriodMonths:"12",
    adminCommissionInvestorPct:"2",
    adminCommissionBusinessPct:"2",
  }));`;

if (code.includes(formDataInitOld)) {
  code = code.replace(formDataInitOld, formDataInitNew);
} else {
  console.log("WARN: formData target not found");
}

const useEffectOld = `  useEffect(() => {
    const checkPending = () => {
      const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
      if (pendingId) {
        setTimeout(() => {
          setAddModalBusinessId(pendingId);
          setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
          setShowAddForm(true);
          setIsFromAnalysis(true);
          setShowInvestorSelect(false); // Make sure it's false to show the new investment form directly
        }, 50);
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
      }
    };
    
    checkPending();
    window.addEventListener("mobileNavigateToInvestments", checkPending);
    return () => window.removeEventListener("mobileNavigateToInvestments", checkPending);
  }, []);`;

const useEffectNew = `  useEffect(() => {
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
    };
    
    // Clear storage on initial mount if it was used for initial state
    if (sessionStorage.getItem("mobileAddInvestmentBusinessId")) {
        sessionStorage.removeItem("mobileAddInvestmentBusinessId");
    }
    
    window.addEventListener("mobileNavigateToInvestments", checkPending);
    return () => window.removeEventListener("mobileNavigateToInvestments", checkPending);
  }, []);`;

if (code.includes(useEffectOld)) {
  code = code.replace(useEffectOld, useEffectNew);
} else {
  console.log("WARN: useEffect target not found");
}

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success Investments Patch");
