const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      const taxConfig = state.settings.inactivityTax;
      if (!taxConfig || !taxConfig.enabled) return;

      const durationMs = taxConfig.durationType === "hours" 
        ? taxConfig.hoursThreshold * 60 * 60 * 1000 
        : taxConfig.daysThreshold * 24 * 60 * 60 * 1000;
        
      const taxAmount = taxConfig.durationType === "hours" 
        ? taxConfig.hourlyAmount 
        : taxConfig.dailyAmount;

      if (taxAmount <= 0) return;`;

const newStr = `      const taxConfig = state.settings.inactivityTax;
      if (!taxConfig || !taxConfig.enabled) return;
        
      const taxAmount = taxConfig.durationType === "minutes"
        ? taxConfig.minuteAmount
        : taxConfig.durationType === "hours" 
          ? taxConfig.hourlyAmount 
          : taxConfig.dailyAmount;

      if (!taxAmount || taxAmount <= 0) return;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx top logic.");
} else {
  console.error("Target string not found in App.tsx (top).");
}

const targetStr2 = `            const initialThresholdMs = taxConfig.durationType === "hours" 
              ? taxConfig.hoursThreshold * 60 * 60 * 1000 
              : taxConfig.daysThreshold * 24 * 60 * 60 * 1000;
              
            if (timeSince0 >= initialThresholdMs) {
              const lastProcessed = taxConfig.lastProcessedMap[investor.id];
              const intervalMs = taxConfig.durationType === "hours" 
                ? taxConfig.hoursThreshold * 60 * 60 * 1000 
                : 24 * 60 * 60 * 1000;
                
              if (!lastProcessed || now - lastProcessed >= intervalMs) {
                taxApplied = true;
                
                const descriptionStr = taxConfig.durationType === "hours" ? taxConfig.hoursThreshold + " hours" : taxConfig.daysThreshold + " days";`;

const newStr2 = `            const initialThresholdMs = taxConfig.durationType === "minutes" 
              ? taxConfig.minutesThreshold * 60 * 1000 
              : taxConfig.durationType === "hours" 
                ? taxConfig.hoursThreshold * 60 * 60 * 1000 
                : taxConfig.daysThreshold * 24 * 60 * 60 * 1000;
              
            if (timeSince0 >= initialThresholdMs) {
              const lastProcessed = taxConfig.lastProcessedMap[investor.id];
              const intervalMs = taxConfig.durationType === "minutes" 
                ? taxConfig.minutesThreshold * 60 * 1000 
                : taxConfig.durationType === "hours" 
                  ? taxConfig.hoursThreshold * 60 * 60 * 1000 
                  : 24 * 60 * 60 * 1000;
                
              if (!lastProcessed || now - lastProcessed >= intervalMs) {
                taxApplied = true;
                
                const descriptionStr = taxConfig.durationType === "minutes" ? taxConfig.minutesThreshold + " minutes" : taxConfig.durationType === "hours" ? taxConfig.hoursThreshold + " hours" : taxConfig.daysThreshold + " days";`;

if (code.includes(targetStr2)) {
  code = code.replace(targetStr2, newStr2);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx bottom logic.");
} else {
  console.error("Target string not found in App.tsx (bottom).");
}
