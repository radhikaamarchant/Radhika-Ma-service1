const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

content = content.replace(
  /\.filter\(\(name\) => !state\.investors\.some\(\(inv\) => \(inv\.name \|\| ""\)\.toLowerCase\(\) === \(name \|\| ""\)\.toLowerCase\(\)\)\)/g,
  '.filter((name) => !state.investors.some((inv) => (inv.name || "").toLowerCase() === ((name as string) || "").toLowerCase()))'
);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Patched ts error");
