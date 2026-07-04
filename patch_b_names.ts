import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/pages/Banking.tsx', [
  { from: 'name: b.name,', to: 'name: b.shortName ? b.shortName.toUpperCase() : b.name,' }
]);

replaceInFile('src/pages/DataAnalysis.tsx', [
  { from: '<span className="font-medium text-[13px] text-kite-text">{b.name.toUpperCase()}</span>', to: '<span className="font-medium text-[13px] text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}</span>' },
  { from: '<span className="font-medium text-kite-text">{b.name}</span>', to: '<span className="font-medium text-kite-text">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>' }
]);

replaceInFile('src/pages/Investments.tsx', [
  { from: '<span className="font-medium text-[14px] text-gray-900 dark:text-[#F1F5F9] uppercase">{b.name}</span>', to: '<span className="font-medium text-[14px] text-gray-900 dark:text-[#F1F5F9] uppercase">{b.shortName ? b.shortName.toUpperCase() : b.name}</span>' }
]);

replaceInFile('src/components/AddInvestmentModal.tsx', [
  { from: '{b.name.toUpperCase()}', to: '{b.shortName ? b.shortName.toUpperCase() : b.name.toUpperCase()}' }
]);

replaceInFile('src/pages/MyPnL.tsx', [
  { from: 'source: b.name,', to: 'source: b.shortName ? b.shortName.toUpperCase() : b.name,' },
  { from: '{ label:"Business Name", value: b.name },', to: '{ label:"Business Name", value: b.shortName ? b.shortName.toUpperCase() : b.name },' },
  { from: 'source: b.name,', to: 'source: b.shortName ? b.shortName.toUpperCase() : b.name,' },
  { from: '{ label:"Business Name", value: b.name },', to: '{ label:"Business Name", value: b.shortName ? b.shortName.toUpperCase() : b.name },' }
]);

console.log("Success B Names Patch");
