const fs = require('fs');

let code = fs.readFileSync('src/types.ts', 'utf8');

const targetStr = `  inactivityTax?: {
    enabled: boolean;
    durationType: "hours" | "days";
    hourlyAmount: number;
    hoursThreshold: number;
    dailyAmount: number;
    daysThreshold: number;
  };`;

const newStr = `  inactivityTax?: {
    enabled: boolean;
    durationType: "hours" | "days";
    hourlyAmount: number;
    hoursThreshold: number;
    dailyAmount: number;
    daysThreshold: number;
    lastProcessedMap?: Record<string, number>;
    inactivityStartMap?: Record<string, number>;
  };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/types.ts', code);
  console.log("Updated types.ts");
} else {
  console.error("Target string not found in types.ts.");
}
