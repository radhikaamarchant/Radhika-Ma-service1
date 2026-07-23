const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetOld = `  const businessInvestments = state.investments\n    .filter((inv) => inv.businessId === businessId)\n    .sort((a, b) => getTime(b.id) - getTime(a.id));`;
const targetNew = `  const businessInvestments = useMemo(() => state.investments\n    .filter((inv) => inv.businessId === businessId)\n    .sort((a, b) => getTime(b.id) - getTime(a.id)), [state.investments, businessId]);\n\n  const filteredBusinessInvestments = useMemo(() => businessInvestments.filter(inv => {\n    const investor = state.investors.find(i => i.id === inv.investorId);\n    return investor?.name?.toLowerCase().includes(debouncedInvestorSearchQuery.toLowerCase());\n  }), [businessInvestments, state.investors, debouncedInvestorSearchQuery]);`;
code = code.replace(targetOld, targetNew);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
