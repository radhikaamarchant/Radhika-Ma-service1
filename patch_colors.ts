import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(
  `      --color-kite-blue: #4184F3;
      --color-kite-green: #4CAF50;
      --color-kite-red: #FF5B5B;`,
  `      --color-kite-blue: #4184F3;
      --color-kite-green: #5C9A5D;
      --color-kite-red: #DF5A5A;`
);

fs.writeFileSync('src/index.css', content);
console.log("Success colors patch");
