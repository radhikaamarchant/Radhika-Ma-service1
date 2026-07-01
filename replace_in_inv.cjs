const fs = require('fs');
const invFile = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
const invLines = invFile.split('\n');

const startIdx = 683; // line 684 is index 683
const endIdx = 978; // line 979 is index 978

const before = invLines.slice(0, startIdx).join('\n');
const after = invLines.slice(endIdx + 1).join('\n');

const replacement = `        <AddInvestmentModal \n          isOpen={showAddForm}\n          onClose={() => setShowAddForm(false)}\n          initialBusinessId=""\n        />`;

fs.writeFileSync('src/pages/Investments.tsx', before + '\n' + replacement + '\n' + after);
console.log('done replacing in Investments');
