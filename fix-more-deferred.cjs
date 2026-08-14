const fs = require('fs');

// Fix Businesses.tsx modals
let bCode = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');
if (!bCode.includes('deferredOwnerSearch')) {
  bCode = bCode.replace(
    'const deferredSearchTerm = useDeferredValue(searchTerm);',
    `const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredOwnerSearch = useDeferredValue(ownerSearch);
  const deferredBankSearch = useDeferredValue(bankSearch);
  const deferredInvestorSearch = useDeferredValue(investorSearch);`
  );
  bCode = bCode.replace(/ownerSearch\.toLowerCase\(\)/g, 'deferredOwnerSearch.toLowerCase()');
  bCode = bCode.replace(/bankSearch\.toLowerCase\(\)/g, 'deferredBankSearch.toLowerCase()');
  bCode = bCode.replace(/investorSearch\.toLowerCase\(\)/g, 'deferredInvestorSearch.toLowerCase()');
  fs.writeFileSync('src/pages/Businesses.tsx', bCode);
}

// Fix Investors.tsx modals
let iCode = fs.readFileSync('src/pages/Investors.tsx', 'utf8');
if (!iCode.includes('deferredOwnerSearch')) {
  iCode = iCode.replace(
    'const deferredSearchTerm = useDeferredValue(searchTerm);',
    `const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredOwnerSearch = useDeferredValue(ownerSearch);
  const deferredBankSearch = useDeferredValue(bankSearch);`
  );
  iCode = iCode.replace(/ownerSearch\.toLowerCase\(\)/g, 'deferredOwnerSearch.toLowerCase()');
  iCode = iCode.replace(/bankSearch\.toLowerCase\(\)/g, 'deferredBankSearch.toLowerCase()');
  fs.writeFileSync('src/pages/Investors.tsx', iCode);
}

