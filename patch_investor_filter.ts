import fs from 'fs';
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const targetStr = `{sortedInvestors.filter(i => i.name.toLowerCase().includes(investorSearch.toLowerCase())).map(i => {
                                    const activeCount = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;`;

const replaceStr = `{sortedInvestors.filter(i => {
                                    if (!i.name.toLowerCase().includes(investorSearch.toLowerCase())) return false;
                                    if (!isMobile && orderMode === "SELL" && selectedBusiness) {
                                      const hasActive = state.investments.some((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active");
                                      if (!hasActive) return false;
                                    }
                                    return true;
                                  }).map(i => {
                                    const activeCount = selectedBusiness ? state.investments.filter((inv: any) => inv.investorId === i.id && inv.businessId === selectedBusiness.id && inv.status === "active").length : 0;`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
console.log("Success Filter Patch");
