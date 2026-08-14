const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /sort\(\(a, b\) => \{\n    if \(sortBy === "investment"\) \{\n      return b\.liveTotalValue - a\.liveTotalValue;\n    \}\n    return a\.interestRate - b\.interestRate;\n  \}\);/,
  `sort((a, b) => {
    if (sortBy === "investment") {
      return b.liveTotalValue - a.liveTotalValue;
    }
    return a.interestRate - b.interestRate;
  }) : [];`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
