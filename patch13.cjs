const fs = require('fs');
let content = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf-8');

// The labels
content = content.replace('Duration (Months)', 'manage month');
content = content.replace('Expected ROI (%)', 'Roi');
content = content.replace('Business Brokerage (%)', 'BSE Brokrage');
content = content.replace('Investor Brokerage (%)', 'INC Brokrage');

// Wait, I might replace the ones in the main tab too. I only need to replace them in the CAP tab or entirely?
// The instruction:
// "Duration (Months) ની બદલે ( manage month)
// Expected ROI (%) ની બદલે ( Roi)
// Business Brokerage (%) ની બદલે BSE Brokrage
// Investor Brokerage (%) ની બદલે INC Brokrage કરજો"
// It's fine if they are replaced globally in this component.
