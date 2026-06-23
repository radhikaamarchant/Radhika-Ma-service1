import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx')) {
      callback(p);
    }
  }
}

walk('src', (filepath) => {
  if (filepath.includes('Investors.tsx')) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // Aggressively make typography smaller on mobile everywhere so it's super app-like
  content = content.replace(/text-sm md:text-lg/g, 'text-xs md:text-base');
  content = content.replace(/text-base md:text-xl/g, 'text-sm md:text-xl');

  // Shrink borders and paddings more for mobile forms
  content = content.replace(/p-3 /g, 'p-1.5 md:p-3 ');
  content = content.replace(/p-4 /g, 'p-2 md:p-4 ');
  
  // Make gap tiny on mobile
  content = content.replace(/gap-4/g, 'gap-2 md:gap-4');
  
  fs.writeFileSync(filepath, content, 'utf8');
});
