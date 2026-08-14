const fs = require('fs');
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const targetStart = 'const filteredInvestors = useMemo(() => uniqueInvestors';
const endStr = '  ), [uniqueInvestors, searchTerm, state.investments, state.businesses, state.settings, marketState.trends]);';

if (code.includes(targetStart)) {
  const startIndex = code.indexOf(targetStart);
  const endIndex = code.indexOf(endStr, startIndex) + endStr.length;
  
  if (startIndex !== -1 && endIndex !== -1) {
    const oldBlock = code.substring(startIndex, endIndex);
    
    // Replace the block
    let newBlock = oldBlock.replace('const filteredInvestors =', 'const investorsWithStats =');
    
    // Remove the filter part at the top of investorsWithStats
    newBlock = newBlock.replace(/\.filter\(\s*\(\w\)\s*=>\s*\(\w\.name \|\| ""\)\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s*\w\.investorId\.includes\(searchTerm\),\s*\)/, '');
    
    // Change dependencies array
    newBlock = newBlock.replace(
      '[uniqueInvestors, searchTerm, state.investments, state.businesses, state.settings, marketState.trends]',
      '[uniqueInvestors, state.investments, state.businesses, state.settings, marketState.trends]'
    );
    
    const filteredBlock = `\n  const filteredInvestors = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return investorsWithStats.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(term) ||
        i.investorId.includes(term)
    );
  }, [investorsWithStats, deferredSearchTerm]);\n`;
    
    code = code.substring(0, startIndex) + newBlock + filteredBlock + code.substring(endIndex);
    fs.writeFileSync('src/pages/Investors.tsx', code);
  }
}

