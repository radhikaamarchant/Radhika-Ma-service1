const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(/activeBidsApps\.map\(\(app: any\) => \{/g, 'activeBidsApps.map((app: any, i: number) => {');
content = content.replace(/activeBidsApps\.map\(\(app\) => \{/g, 'activeBidsApps.map((app: any, i: number) => {');

// wait, let's just make sure all .map((app: any) are covered
content = content.replace(/\.map\(\(app: any\) => \{/g, '.map((app: any, i: number) => {');

fs.writeFileSync('src/pages/Investors.tsx', content);

console.log("Fixed Investors.tsx map");
