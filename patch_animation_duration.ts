import fs from 'fs';

let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
code = code.replace(`transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}`, `transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}`);
fs.writeFileSync('src/pages/Investments.tsx', code);
console.log("Success");
