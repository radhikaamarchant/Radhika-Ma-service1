const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// Remove from the end of the file
content = content.replace(
  /\s*<AddInvestmentModal[\s\S]*?initialInvestorId=\{addModalInvestorId\}\s*\/>\s*(?=\s*<\/div>\s*\}\s*$)/,
  ''
);

// Add to the end of the Investors component (right before `</div>\n  );\n}\n\n// Sub-component`)
const marker = "{selectedPortfolioInvestment && (";
const newBlock = `
      <AddInvestmentModal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        initialBusinessId={addModalBusinessId}
        initialInvestorId={addModalInvestorId}
      />
      `;

content = content.replace(marker, newBlock + marker);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed Investors.tsx");
