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

  // Fix `<Icon className="w-..." className={` or `<Icon className="w-..." className="...`
  // We want to combine them: `className={`w-1 w-2 ${isActive ? ...}`} `
  // Since JSX double classNames don't compile, we will fix them manually using regex.
  
  // Find instances of `<Component className="some class" className={`
  content = content.replace(/className="([^"]+)" className=\{/g, 'className={`$1 ${');
  
  // Wait, there could be `className="some" className="other"`
  content = content.replace(/className="([^"]+)" className="/g, 'className="$1 ');
  
  fs.writeFileSync(filepath, content, 'utf8');
});
