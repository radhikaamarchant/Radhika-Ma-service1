const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf-8');

const oldAbs = `<span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : 'text-[#4CAF50] dark:text-[#5B9A5D]'}\`}>
        {formatValue(absoluteChange)}
      </span>`;

const newAbs = `<span className="text-right text-[13px] md:text-[13px] font-medium text-[#9B9B9B] dark:text-[#666666]">
        {formatValue(absoluteChange)}
      </span>`;

const oldPerc = `<span className={\`text-right text-[13px] md:text-[13px] font-medium \${percentageChange < 0 ? 'text-[#DF514C] dark:text-[#E25F5B]' : 'text-[#4CAF50] dark:text-[#5B9A5D]'}\`}>
        {formatValue(percentageChange)}%
      </span>`;

const newPerc = `<span className="text-right text-[13px] md:text-[13px] font-medium text-[#444444D9] dark:text-[#BBBBBBD9]">
        {formatValue(percentageChange)}%
      </span>`;

content = content.replace(oldAbs, newAbs);
content = content.replace(oldPerc, newPerc);

fs.writeFileSync('src/components/BusinessSidebar.tsx', content);
console.log("Updated sidebar colors.");
