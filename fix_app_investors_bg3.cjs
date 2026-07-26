const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  '${currentView === "businesses" ? "bg-[#f2f2f2]" : "bg-white"}',
  '${currentView === "businesses" ? "bg-[#f2f2f2]" : currentView === "investors" ? "bg-[#ececed]" : "bg-white"}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx investors bg properly 2");
