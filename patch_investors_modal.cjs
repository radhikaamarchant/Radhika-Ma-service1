const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

if (!content.includes("<AddInvestmentModal")) {
    const lines = content.split('\n');
    let lastDivIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('</div>')) {
            lastDivIdx = i;
            break;
        }
    }
    
    if (lastDivIdx !== -1) {
        lines.splice(lastDivIdx, 0, 
`      <AddInvestmentModal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        initialBusinessId={addModalBusinessId}
        initialInvestorId={addModalInvestorId}
      />`);
        content = lines.join('\n');
        fs.writeFileSync('src/pages/Investors.tsx', content);
        console.log("Injected AddInvestmentModal");
    }
} else {
    console.log("Already injected.");
}
