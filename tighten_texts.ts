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
  let content = fs.readFileSync(filepath, 'utf8');

  // Fix fixed texts
  content = content.replace(/(?<!md:|sm:|lg:|xl:)text-lg/g, 'text-sm md:text-lg');
  content = content.replace(/(?<!md:|sm:|lg:|xl:)text-xl/g, 'text-base md:text-xl');
  content = content.replace(/(?<!md:|sm:|lg:|xl:)text-2xl/g, 'text-lg md:text-2xl');
  content = content.replace(/(?<!md:|sm:|lg:|xl:)text-3xl/g, 'text-xl md:text-3xl');
  content = content.replace(/(?<!md:|sm:|lg:|xl:)text-4xl/g, 'text-2xl md:text-4xl');

  fs.writeFileSync(filepath, content, 'utf8');
});
