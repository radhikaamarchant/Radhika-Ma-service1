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

const sizeMap: Record<string, string> = {
  '120': 'w-16 h-16 md:w-32 md:h-32',
  '64': 'w-10 h-10 md:w-16 md:h-16',
  '56': 'w-8 h-8 md:w-14 md:h-14',
  '48': 'w-8 h-8 md:w-12 md:h-12',
  '32': 'w-6 h-6 md:w-8 md:h-8',
  '28': 'w-5 h-5 md:w-7 md:h-7',
  '24': 'w-4 h-4 md:w-6 md:h-6',
  '22': 'w-4 h-4 md:w-5 md:h-5',
  '20': 'w-4 h-4 md:w-5 md:h-5',
  '18': 'w-3.5 h-3.5 md:w-4 md:h-4',
  '16': 'w-3 md:w-4 h-3 md:h-4',
  '14': 'w-3 md:w-3.5 h-3 md:h-3.5',
  '12': 'w-2.5 md:w-3 h-2.5 md:h-3',
};

walk('src', (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');

  // AGGRESSIVE MOBILE TYPOGRAPHY REDUCTION
  content = content.replace(/text-sm sm:text-lg md:text-xl/g, 'text-sm md:text-lg');
  content = content.replace(/text-base sm:text-lg md:text-xl/g, 'text-sm md:text-lg');
  content = content.replace(/text-lg sm:text-xl md:text-2xl/g, 'text-base md:text-xl');
  content = content.replace(/text-4xl/g, 'text-2xl md:text-4xl');
  content = content.replace(/text-3xl/g, 'text-xl md:text-3xl');
  content = content.replace(/text-2xl/g, 'text-lg md:text-2xl');
  content = content.replace(/text-xl/g, 'text-base md:text-xl');
  
  // Specific fix for existing messed up overlaps
  content = content.replace(/(text-sm md:text-lg )+/g, 'text-sm md:text-lg ');
  content = content.replace(/(text-base md:text-xl )+/g, 'text-base md:text-xl ');

  // MASSIVE ICON SIZE REDUCTION
  // Replace size={X} and merge with className if it exists
  // E.g. `<Icon size={24} className="text-red-500" />` -> `<Icon className="w-4 h-4 md:w-6 md:h-6 text-red-500" />`
  // E.g. `<Icon className="text-red-500" size={24} />` -> `<Icon className="text-red-500 w-4 h-4 md:w-6 md:h-6" />`
  // E.g. `<Icon size={24} />` -> `<Icon className="w-4 h-4 md:w-6 md:h-6" />`
  
  // Look for components that have size={X}
  content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^>]*?)size=\{([0-9]+)\}([^>]*?>)/g, (match, prefix, size, suffix) => {
    const sizeClasses = sizeMap[size] || `w-[${size}px] h-[${size}px]`;
    
    // Check if there is already a className in prefix or suffix
    const fullTag = prefix + suffix;
    if (fullTag.includes('className="')) {
      // Inject sizeClasses into the existing className
      return fullTag.replace(/className="/, `className="${sizeClasses} `);
    } else {
      // Add className with sizeClasses
      // Insert right where size={X} was (end of prefix)
      return `${prefix}className="${sizeClasses}"${suffix}`;
    }
  });

  // Since we might have replaced `size={X}` before className or after, the logic `prefix + suffix` works but let's double check if some multiple size={X} exist in one tag (should be rare).

  // PADDING AND MARGIN REDUCTION FOR MOBILE COMPACTNESS
  content = content.replace(/p-12/g, 'p-8');
  content = content.replace(/p-6/g, 'p-3 md:p-6');
  content = content.replace(/p-5/g, 'p-3 md:p-5');
  // Make gap smaller
  content = content.replace(/gap-8/g, 'gap-4 md:gap-8');
  content = content.replace(/gap-6/g, 'gap-3 md:gap-6');
  
  // Make tables more compact on mobile
  content = content.replace(/td className="p-4 /g, 'td className="p-2 md:p-4 ');
  content = content.replace(/td className="p-3 /g, 'td className="p-1.5 md:p-3 ');
  content = content.replace(/th className="p-4 /g, 'th className="p-2 md:p-4 ');
  
  content = content.replace(/mb-8/g, 'mb-4 md:mb-8');
  content = content.replace(/mt-8/g, 'mt-4 md:mt-8');
  content = content.replace(/mb-6/g, 'mb-3 md:mb-6');
  content = content.replace(/mt-6/g, 'mt-3 md:mt-6');

  // specific investor fix
  // "Credit Investor" button and "Withdraw" layout
  // Make headers text-base instead of text-xl
  content = content.replace(/text-sm md:text-lg font-black tracking-widest text-black/g, 'text-base md:text-xl font-black tracking-widest text-black');
  
  fs.writeFileSync(filepath, content, 'utf8');
});
