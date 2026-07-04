import fs from 'fs';

function replaceInFile(filename: string, searches: {from: string|RegExp, to: string}[]) {
  let content = fs.readFileSync(filename, 'utf8');
  for (const s of searches) {
    content = content.replace(s.from, s.to);
  }
  fs.writeFileSync(filename, content);
}

replaceInFile('src/pages/Businesses.tsx', [
  { from: '{business.name?.toUpperCase()}', to: '{business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}' }
]);

replaceInFile('src/pages/Dashboard.tsx', [
  { from: '{business.name} Details', to: '{business.shortName ? business.shortName.toUpperCase() : business.name} Details' }
]);

replaceInFile('src/pages/DataAnalysis.tsx', [
  { from: '<span>{business.name?.toUpperCase()}</span>', to: '<span>{business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}</span>' }
]);

replaceInFile('src/pages/Investors.tsx', [
  { from: '{business.name?.toUpperCase()}', to: '{business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}' }
]);

replaceInFile('src/pages/MyPnL.tsx', [
  { from: 'const bName = business ? business.name : "Unknown";', to: 'const bName = business ? (business.shortName ? business.shortName.toUpperCase() : business.name) : "Unknown";' }
]);

replaceInFile('src/components/BusinessSidebar.tsx', [
  { from: 'name={business.name}', to: 'name={business.shortName ? business.shortName.toUpperCase() : business.name}' }
]);

replaceInFile('src/components/BusinessDetail.tsx', [
  { from: '{business.name || "BUSINESS NAME"}', to: '{business.shortName ? business.shortName.toUpperCase() : (business.name || "BUSINESS NAME")}' },
  { from: '{business.name?.substring(0, 2).toUpperCase() || "BU"}', to: '{(business.shortName || business.name)?.substring(0, 2).toUpperCase() || "BU"}' }
]);

console.log("Success Names Patch");
