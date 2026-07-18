const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const errorContent = `      >
        {""}
        {renderedList}
      <AnimatePresence>`;

const fixedContent = `      >
        {""}
        {renderedList}
      </div>{""}
      <AnimatePresence>`;

if (code.includes(errorContent)) {
  code = code.replace(errorContent, fixedContent);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Fixed syntax error!');
} else {
  console.log('Could not find error content');
}
