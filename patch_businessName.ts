import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/utils/MarketSimulationContext.tsx', [
  { from: /businessName: b\.name/g, to: 'businessName: b.shortName ? b.shortName.toUpperCase() : b.name' },
  { from: /\$\{b\.name\}/g, to: '${b.shortName ? b.shortName.toUpperCase() : b.name}' }
]);

replaceInFile('src/pages/Investments.tsx', [
  { from: 'businessName: selectedBusiness.name,', to: 'businessName: selectedBusiness.shortName ? selectedBusiness.shortName.toUpperCase() : selectedBusiness.name,' }
]);

console.log("Success businessName patch");
