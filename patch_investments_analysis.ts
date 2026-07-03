import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const targetState = `  const [showBusinessSelect, setShowBusinessSelect] = useState(false);`;
const replacementState = `  const [isFromAnalysis, setIsFromAnalysis] = useState(false);
  const [showBusinessSelect, setShowBusinessSelect] = useState(false);`;

code = code.replace(targetState, replacementState);

const targetEffect = `  useEffect(() => {
    const pendingId = sessionStorage.getItem("mobileAddInvestmentBusinessId");
    if (pendingId) {
      setAddModalBusinessId(pendingId);
      setFormData((prev: any) => ({ ...prev, businessId: pendingId }));
      setShowAddForm(true);
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
      sessionStorage.removeItem("mobileAddInvestmentBusinessId");
    }
  }, []);`;

code = code.replace(targetEffect, replacementEffect);

const targetBusinessSelectDiv = `                  {/* Business & Investor Select */}
                  <div className="flex flex-col">
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10" onClick={() => setShowBusinessSelect(true)}>
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Business</p>`;

const replacementBusinessSelectDiv = `                  {/* Business & Investor Select */}
                  <div className="flex flex-col">
                     {!isFromAnalysis && (
                     <div className="w-full border-b border-gray-200 dark:border-[#44546A] p-4 relative z-10" onClick={() => setShowBusinessSelect(true)}>
                        <p className="text-[11px] text-gray-500 dark:text-[#A3ACB8] font-medium mb-1 uppercase tracking-wider">Business</p>`;

const targetChevron = `                          <ChevronDown className="w-4 h-4 text-[#4184F3]" />
                        </div>
                     </div>`;

const replacementChevron = `                          <ChevronDown className="w-4 h-4 text-[#4184F3]" />
                        </div>
                     </div>
                     )}`;

code = code.replace(targetBusinessSelectDiv, replacementBusinessSelectDiv);
code = code.replace(targetChevron, replacementChevron);

const resetTarget = `            onClick={() => {
              if (!showAddForm) {
                setFormData({ businessId: "", investorId: "", amount: "", timePeriodMonths: "12", adminCommissionInvestorPct: "2", adminCommissionBusinessPct: "2" });
                setAddModalBusinessId("");
                setAddModalInvestorId("");
              }`;

const resetReplacement = `            onClick={() => {
              if (!showAddForm) {
                setFormData({ businessId: "", investorId: "", amount: "", timePeriodMonths: "12", adminCommissionInvestorPct: "2", adminCommissionBusinessPct: "2" });
                setAddModalBusinessId("");
                setAddModalInvestorId("");
                setIsFromAnalysis(false);
              }`;

code = code.replace(resetTarget, resetReplacement);

const closeTarget = `                onClick={() => setShowAddForm(false)}
                className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center"`;

const closeReplacement = `                onClick={() => { setShowAddForm(false); setIsFromAnalysis(false); }}
                className="text-gray-700 dark:text-[#F1F5F9] p-2 -ml-2 flex items-center justify-center"`;

code = code.replace(closeTarget, closeReplacement);

fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
