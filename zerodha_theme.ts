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

  // Change font weights to be less heavy (more like Kite)
  content = content.replace(/font-black/g, 'font-bold');
  content = content.replace(/font-bold/g, 'font-medium'); // wait this will run sequentially, so font-black -> font-bold -> font-medium. That might make everything medium.
  
  // To avoid that, let's use a replacer function
  content = content.replace(/font-black|font-bold|font-semibold/g, (match) => {
    switch(match) {
      case 'font-black': return 'font-semibold'; // Kite headers are semibold
      case 'font-bold': return 'font-medium'; // Standard bold is medium in Kite
      case 'font-semibold': return 'font-medium';
      default: return match;
    }
  });

  // Background colors: Kite uses very clean white and gray
  // Let's replace heavy border colors
  content = content.replace(/border-gray-300/g, 'border-gray-200');
  content = content.replace(/border-gray-400/g, 'border-gray-200');
  content = content.replace(/rounded-xl/g, 'rounded-md md:rounded-lg');
  content = content.replace(/rounded-2xl/g, 'rounded-lg md:rounded-xl');
  content = content.replace(/rounded-lg/g, 'rounded md:rounded-md'); // kite uses barely rounded corners

  // Button sizes on mobile
  content = content.replace(/py-2 sm:py-3/g, 'py-1.5 md:py-2');
  content = content.replace(/px-4 sm:px-8/g, 'px-3 md:px-6');
  
  // Kite mostly uses blue for primary actions
  content = content.replace(/bg-black hover:bg-gray-800 text-white/g, 'bg-blue-600 hover:bg-blue-700 text-white');

  fs.writeFileSync(filepath, content, 'utf8');
});
