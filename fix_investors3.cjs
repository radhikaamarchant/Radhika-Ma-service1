const fs = require('fs');
let lines = fs.readFileSync('src/pages/Investors.tsx', 'utf8').split('\n');

// The file likely ends with:
//       <AddInvestmentModal 
//         isOpen={showAddForm}
//         onClose={() => setShowAddForm(false)}
//         initialBusinessId={addModalBusinessId}
//         initialInvestorId={addModalInvestorId}
//       />
//     </div>
//   );
// }

// Find the last occurrence of "<AddInvestmentModal" and strip it.
let lastIdx = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('<AddInvestmentModal')) {
    lastIdx = i;
    break;
  }
}

if (lastIdx > 2000) { // Make sure we are at the very bottom
  lines.splice(lastIdx, 6); // Remove those 6 lines
}
fs.writeFileSync('src/pages/Investors.tsx', lines.join('\n'));
