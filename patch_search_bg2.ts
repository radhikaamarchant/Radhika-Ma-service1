import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/pages/Investors.tsx', [
  { from: 'dark:placeholder:text-[#7A7A7A]', to: 'dark:placeholder-[#7A7A7A]' },
]);

replaceInFile('src/pages/Investments.tsx', [
  { from: 'dark:placeholder:text-[#7A7A7A]', to: 'dark:placeholder-[#7A7A7A]' },
]);

replaceInFile('src/pages/Businesses.tsx', [
  { from: 'dark:placeholder:text-[#7A7A7A]', to: 'dark:placeholder-[#7A7A7A]' },
]);

console.log("Success placeholder fix");
