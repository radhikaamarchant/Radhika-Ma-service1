const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  'durationType: "hours" | "days";',
  'durationType: "minutes" | "hours" | "days";'
);
code = code.replace(
  'hourlyAmount: number;',
  'minuteAmount?: number;\n    minutesThreshold?: number;\n    hourlyAmount: number;'
);
fs.writeFileSync('src/types.ts', code);
