import fs from 'fs';
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');
code = code.replace(`                onClick={() => {
                  setAddModalBusinessId(b.id);
                  setShowAddModal(true);
                }}`, `                onClick={() => {
                  if (onNavigate) {
                    sessionStorage.setItem("mobileAddInvestmentBusinessId", b.id);
                    window.dispatchEvent(new Event("mobileNavigateToInvestments"));
                    onNavigate("investments");
                  }
                }}`);
fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
console.log("Success DataAnalysis Revert");
