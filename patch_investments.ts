import fs from 'fs';

let content = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

content = content.replace(
  /{business\?\.name\?\.toUpperCase\(\) \|\| "UNKNOWN BUSINESS"}/g,
  '{business?.shortName ? business.shortName.toUpperCase() : (business?.name?.toUpperCase() || "UNKNOWN BUSINESS")}'
);

content = content.replace(
  /{business\?\.name\?\.toUpperCase\(\)}\{""}/g,
  '{business?.shortName ? business.shortName.toUpperCase() : business?.name?.toUpperCase()}{""}'
);

content = content.replace(
  /businessName: business\?\.name \|\| "",/g,
  'businessName: business?.shortName ? business.shortName.toUpperCase() : (business?.name || ""),'
);

content = content.replace(
  /business\?\.name\.toLowerCase\(\)\.includes\(match\)/g,
  '(business?.shortName ? business.shortName.toLowerCase().includes(match) : business?.name.toLowerCase().includes(match))'
);


fs.writeFileSync('src/pages/Investments.tsx', content);
console.log("Success Investments Patch");
