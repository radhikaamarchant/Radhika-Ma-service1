const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /<div key=\{b\.id\} onClick=\{\(\) => \{\s*if \(onNavigate\) \{\s*sessionStorage\.setItem\("mobileAddInvestmentBusinessId", b\.id\);\s*window\.dispatchEvent\(new Event\("mobileNavigateToInvestments"\)\);\s*onNavigate\("investments"\);\s*\}\s*\}\} className="p-3/g,
  `<div key={b.id} onClick={() => {
    if (isDesktop) {
        setPremiumBusiness(b);
    } else if (onNavigate) {
      sessionStorage.setItem("mobileAddInvestmentBusinessId", b.id);
      window.dispatchEvent(new Event("mobileNavigateToInvestments"));
      onNavigate("investments");
    }
  }} className="p-3`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
