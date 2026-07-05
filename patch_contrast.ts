import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/pages/Investors.tsx', [
  { from: 'className="hover:bg-gray-50/50 transition-colors cursor-pointer group"', to: 'className="hover:bg-gray-50/50 dark:hover:bg-[#202020] transition-colors cursor-pointer group"' },
  { from: 'className="hover:bg-gray-50/50 transition-colors cursor-pointer group"', to: 'className="hover:bg-gray-50/50 dark:hover:bg-[#202020] transition-colors cursor-pointer group"' },
  { from: 'md:hover:bg-gray-50 transition-colors cursor-pointer"', to: 'md:hover:bg-gray-50 dark:md:hover:bg-[#202020] transition-colors cursor-pointer"' },
  { from: 'md:hover:bg-gray-50 transition-colors cursor-pointer"', to: 'md:hover:bg-gray-50 dark:md:hover:bg-[#202020] transition-colors cursor-pointer"' }
]);

replaceInFile('src/components/LivePortfolioDetail.tsx', [
  { from: 'hover:bg-gray-50 rounded-full', to: 'hover:bg-gray-50 dark:hover:bg-[#202020] rounded-full' },
  { from: 'hover:bg-gray-50 rounded-full', to: 'hover:bg-gray-50 dark:hover:bg-[#202020] rounded-full' },
  { from: 'hover:bg-kite-bg transition-colors', to: 'hover:bg-kite-bg dark:hover:bg-[#202020] transition-colors' },
  { from: 'hover:bg-kite-bg transition-colors border-t', to: 'hover:bg-kite-bg dark:hover:bg-[#202020] transition-colors border-t' }
]);

console.log("Success contrast patch");
