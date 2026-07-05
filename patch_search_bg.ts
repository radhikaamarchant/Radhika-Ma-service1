import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/pages/Investors.tsx', [
  { from: 'md:bg-transparent', to: 'md:bg-gray-100 md:dark:bg-[#161616]' },
  { from: 'placeholder-gray-400', to: 'placeholder-gray-400 dark:placeholder:text-[#7A7A7A]' },
  { from: 'dark:text-[#8F8F8F]', to: 'dark:text-[#7A7A7A]' },
  { from: 'dark:text-[#A3ACB8]', to: 'dark:text-[#7A7A7A]' }
]);

replaceInFile('src/pages/Investments.tsx', [
  { from: 'md:bg-transparent', to: 'md:bg-gray-100 md:dark:bg-[#161616]' },
  { from: 'placeholder-gray-400', to: 'placeholder-gray-400 dark:placeholder:text-[#7A7A7A]' },
  { from: 'dark:text-[#A3ACB8]', to: 'dark:text-[#7A7A7A]' }
]);

replaceInFile('src/pages/Businesses.tsx', [
  { from: 'bg-white dark:bg-kite-surface rounded-sm shadow-sm', to: 'bg-white dark:bg-kite-surface md:dark:bg-[#161616] rounded-sm shadow-sm' },
  { from: 'placeholder-gray-400', to: 'placeholder-gray-400 dark:placeholder:text-[#7A7A7A]' },
  { from: 'dark:text-kite-text-light', to: 'dark:text-[#7A7A7A]' }
]);

replaceInFile('src/pages/DataAnalysis.tsx', [
  { from: 'dark:bg-[#111111]', to: 'md:dark:bg-[#161616] dark:bg-[#111111]' },
  { from: 'dark:text-[#8F8F8F]', to: 'md:dark:text-[#7A7A7A] dark:text-[#8F8F8F]' }
]);

console.log("Success search bg patch");
