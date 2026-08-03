const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      let taxApplied = false;
      let newFundHistoryAdditions = [];

      state.investors.forEach(investor => {
        // Find if investor has any active investments
        const hasActiveInvestments = state.investments.some(inv => inv.investorId === investor.id && inv.status === 'active');
        
        if (!hasActiveInvestments) {
          // Check last processed
          const lastProcessed = taxConfig.lastProcessedMap?.[investor.id] || investor.createdAt || now;
          if (now - lastProcessed >= durationMs) {
            // Apply tax
            taxApplied = true;
            
            // Deduct from investor
            const taxDeduction = {
              id: Date.now().toString() + "-" + investor.id,
              date: new Date().toISOString(),
              amount: taxAmount,
              type: "WITHDRAW",
              title: "Inactivity Tax",
              description: \`Inactivity tax applied for \${taxConfig.durationType === "hours" ? taxConfig.hoursThreshold + " hours" : taxConfig.daysThreshold + " days"}\`,
              category: "tax"
            };

            const updatedInvestor = {
              ...investor,
              fundHistory: [...(investor.fundHistory || []), taxDeduction]
            };
            dispatch({ type: "UPDATE_INVESTOR", payload: updatedInvestor });

            // Ensure lastProcessedMap is updated
            if (!taxConfig.lastProcessedMap) taxConfig.lastProcessedMap = {};
            taxConfig.lastProcessedMap[investor.id] = now;
            
            // Note: we can also create an admin receipt, but the balance will just automatically reflect it if we logic it right, or we can explicitly add to admin
          }
        } else {
          // Reset last processed if they have investments? Actually just update to now so they get a full window when they withdraw
          if (!taxConfig.lastProcessedMap) taxConfig.lastProcessedMap = {};
          taxConfig.lastProcessedMap[investor.id] = now;
          taxApplied = true; // Just to trigger settings update for the map
        }
      });`;

const newStr = `      let taxApplied = false;

      state.investors.forEach(investor => {
        if (investor.id === "admin_investor") return;

        const hasActiveInvestments = state.investments.some(inv => inv.investorId === investor.id && inv.status === 'active');
        
        if (!taxConfig.inactivityStartMap) taxConfig.inactivityStartMap = {};
        if (!taxConfig.lastProcessedMap) taxConfig.lastProcessedMap = {};

        if (!hasActiveInvestments) {
          if (!taxConfig.inactivityStartMap[investor.id]) {
            taxConfig.inactivityStartMap[investor.id] = now;
            taxApplied = true;
          } else {
            const timeSince0 = now - taxConfig.inactivityStartMap[investor.id];
            
            const initialThresholdMs = taxConfig.durationType === "hours" 
              ? taxConfig.hoursThreshold * 60 * 60 * 1000 
              : taxConfig.daysThreshold * 24 * 60 * 60 * 1000;
              
            if (timeSince0 >= initialThresholdMs) {
              const lastProcessed = taxConfig.lastProcessedMap[investor.id];
              const intervalMs = taxConfig.durationType === "hours" 
                ? taxConfig.hoursThreshold * 60 * 60 * 1000 
                : 24 * 60 * 60 * 1000;
                
              if (!lastProcessed || now - lastProcessed >= intervalMs) {
                taxApplied = true;
                
                const descriptionStr = taxConfig.durationType === "hours" ? taxConfig.hoursThreshold + " hours" : taxConfig.daysThreshold + " days";

                const taxDeduction = {
                  id: Date.now().toString() + "-" + investor.id,
                  date: new Date().toISOString(),
                  amount: taxAmount,
                  type: "WITHDRAW",
                  title: \`RMAS KITE invest penalty charge - \${descriptionStr}\`,
                  description: descriptionStr,
                  category: "tax"
                };

                const updatedInvestor = {
                  ...investor,
                  fundHistory: [...(investor.fundHistory || []), taxDeduction]
                };
                dispatch({ type: "UPDATE_INVESTOR", payload: updatedInvestor });

                taxConfig.lastProcessedMap[investor.id] = now;
              }
            }
          }
        } else {
          if (taxConfig.inactivityStartMap[investor.id] || taxConfig.lastProcessedMap[investor.id]) {
            delete taxConfig.inactivityStartMap[investor.id];
            delete taxConfig.lastProcessedMap[investor.id];
            taxApplied = true;
          }
        }
      });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx tax logic.");
} else {
  console.error("Target string not found in App.tsx.");
}
