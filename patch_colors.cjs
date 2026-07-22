const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Update :root.dark variables
code = code.replace(
  /:root\.dark\s*\{[^}]*--color-kite-green:\s*#[0-9a-fA-F]+;/g, 
  match => match.replace(/--color-kite-green:\s*#[0-9a-fA-F]+;/, '--color-kite-green: #5B9A5D;')
);

code = code.replace(
  /:root\.dark\s*\{[^}]*--color-kite-red:\s*#[0-9a-fA-F]+;/g, 
  match => match.replace(/--color-kite-red:\s*#[0-9a-fA-F]+;/, '--color-kite-red: #E25F5B;')
);

fs.writeFileSync('src/index.css', code);
