const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
/                                  <\/div>\s*<\/div>\s*\);\s*\}\)}\s*\{\/\* Active IPO Apps on Mobile \*\/\}/,
`                                  </div>
                                </div>
                                </div>
                              );
                            })}
                            {/* Active IPO Apps on Mobile */}`
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed missing div");
