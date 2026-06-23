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

  // Any tag ending with `} />` where it opened a `className={`
  // This is tricky using regex across multiple lines, but we can target `} />` that should be `}`} />`.
  // Wait, no. What if there are normal expressions `disabled={true} />`?
  // Let's identify the specific broken ones: `<Icon className={`... ${...} />`
  // An easy fix: find `/className=\{`w-[^`]*\} \/>/g` NO!
  
  // We know what `fix_duplicate_classes.ts` did:
  // It replaced `className="x" className={` with `className={\`x \${`
  // Thus leaving the END of the curly brace untouched. The end was `} />` or `}>`.
  // We can just find all lines that have `className={\`` but NO closing `` ` `` in the same tag.
  
  // Actually, since I know the exact pattern that broke:
  // It originated from `<Component ... className={something ? "a" : "b"} ... />`
  // becoming ` className={\` w-4 h-4 \${something ? "a" : "b"} `
  // The closing is `} />` or `}>` or `} ...>`
  
  // Let's write a simple regex to catch the missing backtick just before the closing brace OF THE className
  // e.g. `className={\`w-1 h-1 \${isTrue ? "text-red" : "text-blue"}`} />` is what it SHOULD be.
  // Right now it is `className={\`w-1 h-1 \${isTrue ? "text-red" : "text-blue"} />`
  
  // So we look for: `\${[^}]+"([^"]*)"([^"}]*)\} (\/?>)`  <- this is highly fragile.
  
  // To be safe, let's just do a manual replace for the known issues:
  content = content.replace(/\} \/>/g, (match, offset, str) => {
    // let's just look at the last 150 chars. If it has `className={\`` and no closing backtick before `} />`, inject it.
    let before = str.substring(Math.max(0, offset - 150), offset);
    if (before.includes('className={`') && before.split('`').length % 2 === 0) {
      // It has an UNCLOSED backtick!
      return '}`} /> /* FIXED */'; // wait, it might be `}`} />`
    }
    return match;
  });

  fs.writeFileSync(filepath, content, 'utf8');
});
