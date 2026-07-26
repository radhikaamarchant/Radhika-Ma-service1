const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace bg
content = content.replace(
  /\$\{currentView === "businesses" \? "bg-\\[#f2f2f2\\]" : "bg-white"\}/g,
  `\${currentView === "businesses" ? "bg-[#f2f2f2]" : currentView === "investors" ? "bg-[#ececed]" : "bg-white"}`
);

// Replace border logic
content = content.replace(
  /"border-transparent" : "border-kite-border-soft"\)/g,
  `"border-transparent" : currentView === "investors" ? "border-transparent" : "border-kite-border-soft")`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx investors bg properly");
