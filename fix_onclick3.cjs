const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => \{\s*if \(onNavigate\) \{\s*sessionStorage\.setItem\("mobileAddInvestmentBusinessId", b\.id\);\s*window\.dispatchEvent\(new Event\("mobileNavigateToInvestments"\)\);\s*onNavigate\("investments"\);\s*\}\s*\}\}/g,
  `onClick={() => {
                  if (isDesktop) {
                    setPremiumBusiness(b);
                  } else if (onNavigate) {
                    sessionStorage.setItem("mobileAddInvestmentBusinessId", b.id);
                    window.dispatchEvent(new Event("mobileNavigateToInvestments"));
                    onNavigate("investments");
                  }
                }}`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
