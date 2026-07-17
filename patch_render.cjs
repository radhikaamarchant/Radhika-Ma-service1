const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  /const renderLiveAmount = \(b: any, defaultClass: string =""\) => \{[\s\S]*?return \([\s\S]*?\);\n  \};/g,
  `const renderLiveAmount = (b: any, defaultClass: string ="") => {
    const isUp = b.overallTrend >= b.interestRate;
    const colorClass = isUp ?"text-kite-green" :"text-kite-red";
    return (
      <span className={\`\${colorClass} \${defaultClass}\`}>
        {b.triggerAmount ? formatINR(b.triggerAmount) : '-'}
      </span>
    );
  };`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
