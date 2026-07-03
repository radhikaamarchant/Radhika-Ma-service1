import fs from 'fs';

const code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const targetStr = `                                  {sortedInvestors.filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase())).map(i => (
                                    <button key={i.id} onClick={() => { setFormData({ ...formData, investorId: i.id }); setDesktopShowInvestorSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      {i.name.toUpperCase()}
                                      {formData.investorId === i.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}
                                    </button>
                                  ))}`;

const replacementStr = `                                  {sortedInvestors.filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase())).map(i => {
                                    const activeCount = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;
                                    return (
                                    <button key={i.id} onClick={() => { setFormData({ ...formData, investorId: i.id }); setDesktopShowInvestorSelect(false); }} className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-[#C4C4C4] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span>{i.name.toUpperCase()}</span>
                                        {activeCount > 0 && (
                                          <div className="bg-[#4184F3] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                                            {activeCount}
                                          </div>
                                        )}
                                      </div>
                                      {formData.investorId === i.id && <CheckCircle className="w-3.5 h-3.5 text-[#4184F3]" />}
                                    </button>
                                  )})}`;

if (code.includes(targetStr)) {
  const updatedCode = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/AddInvestmentModal.tsx', updatedCode);
  console.log("Success");
} else {
  console.log("Target string not found!");
}
