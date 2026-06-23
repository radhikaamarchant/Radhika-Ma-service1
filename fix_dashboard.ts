import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Dashboard UI changes for Kite look
content = content.replace(/rounded md:rounded-md/g, 'rounded-sm');
content = content.replace(/ md:rounded-md/g, ''); // catch any stragglers
content = content.replace(/shadow-sm/g, '');
content = content.replace(/hover:shadow-sm/g, '');
content = content.replace(/shadow-2xl/g, 'shadow-lg');
content = content.replace(/hover:shadow/g, '');
content = content.replace(/border-2 border-kite-blue\/30 hover:border-blue-400/g, 'border border-kite-border hover:border-kite-blue');
content = content.replace(/border border-kite-border hover:border-blue-300/g, 'border border-kite-border hover:border-kite-blue');
content = content.replace(/border border-kite-border hover:border-kite-border/g, 'border border-kite-border hover:border-kite-blue');

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
