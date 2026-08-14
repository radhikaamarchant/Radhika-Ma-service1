const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

if (!code.includes('deferredInvestorSearch')) {
  code = code.replace(
    'const [investorSearch, setInvestorSearch] = useState("");',
    'const [investorSearch, setInvestorSearch] = useState("");\n  const deferredInvestorSearch = useDeferredValue(investorSearch);\n  const deferredBusinessSearch = useDeferredValue(businessSearch);'
  );
  
  code = code.replace(
    /\.filter\(i => i\.name\.toLowerCase\(\)\.includes\(investorSearch\.toLowerCase\(\)\) \|\| i\.investorId\.toLowerCase\(\)\.includes\(investorSearch\.toLowerCase\(\)\)\)/g,
    '.filter(i => i.name.toLowerCase().includes(deferredInvestorSearch.toLowerCase()) || i.investorId.toLowerCase().includes(deferredInvestorSearch.toLowerCase()))'
  );

  code = code.replace(
    /\.filter\(b => b\.name\.toLowerCase\(\)\.includes\(businessSearch\.toLowerCase\(\)\) \|\| b\.businessId\.toLowerCase\(\)\.includes\(businessSearch\.toLowerCase\(\)\)\)/g,
    '.filter(b => b.name.toLowerCase().includes(deferredBusinessSearch.toLowerCase()) || b.businessId.toLowerCase().includes(deferredBusinessSearch.toLowerCase()))'
  );

  fs.writeFileSync('src/pages/Investments.tsx', code);
}
