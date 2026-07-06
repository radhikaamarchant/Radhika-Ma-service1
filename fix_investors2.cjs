const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

// I need to properly remove the duplicate one at the very end of the file.
const regex = /<AddInvestmentModal\s+isOpen=\{showAddForm\}\s+onClose=\{\(\) => setShowAddForm\(false\)\}\s+initialBusinessId=\{addModalBusinessId\}\s+initialInvestorId=\{addModalInvestorId\}\s+\/>\s*<\/div>\s*\}\s*;/;
content = content.replace(regex, '</div>\n  );\n}');

fs.writeFileSync('src/pages/Investors.tsx', content);
