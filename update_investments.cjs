const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const sortRegex = /\.sort\(\(a, b\) => \{\s+const timeA = Math\.max\(\.\.\.a\.groupedInvestmentsList\.map\(\(i: any\) => new Date\(i\.startDate \|\| 0\)\.getTime\(\)\)\);\s+const timeB = Math\.max\(\.\.\.b\.groupedInvestmentsList\.map\(\(i: any\) => new Date\(i\.startDate \|\| 0\)\.getTime\(\)\)\);\s+return timeB - timeA;\s+\}\)/;

const newSort = `.sort((a, b) => {
      const getInvTime = (inv) => {
        if (inv.id.startsWith("inv")) {
           return parseInt(inv.id.replace("inv", "").split("_")[0]) || 0;
        }
        return parseInt(inv.id.replace(/\\D/g, "")) || new Date(inv.startDate || 0).getTime();
      };
      const timeA = Math.max(...a.groupedInvestmentsList.map(getInvTime));
      const timeB = Math.max(...b.groupedInvestmentsList.map(getInvTime));
      return timeB - timeA;
    })`;

code = code.replace(sortRegex, newSort);
fs.writeFileSync('src/pages/Investments.tsx', code);
