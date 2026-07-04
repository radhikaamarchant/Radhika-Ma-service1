import fs from 'fs';
let code = fs.readFileSync('src/hooks/useMobileBackNavigation.ts', 'utf8');

code = code.replace(
  `setTimeout(() => {\n      isPopping = false;\n      document.body.classList.remove('is-popping');\n    }, 100);`,
  `setTimeout(() => {\n      isPopping = false;\n      document.body.classList.remove('is-popping');\n    }, 500);`
);

fs.writeFileSync('src/hooks/useMobileBackNavigation.ts', code);
console.log("Success Hook Timeout Patch");
