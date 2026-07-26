const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace bg-white with conditional bg
content = content.replace(
  /\`md:hidden flex items-center justify-between px-4 pb-3 bg-white border-b shrink-0 z-40 fixed top-0 left-0 right-0 mobile-header-safe/g,
  \`md:hidden flex items-center justify-between px-4 pb-3 \${currentView === "businesses" ? "bg-[#f2f2f2]" : "bg-white"} border-b shrink-0 z-40 fixed top-0 left-0 right-0 mobile-header-safe\`
);

// We need to remove the border-b if currentView is businesses so it merges smoothly?
content = content.replace(
  /\(currentView === "data-analysis" \|\| currentView === "businesses" \|\| currentView === "investors"\) \? "dark:bg-\\[#1c2a37\\] dark:border-transparent border-kite-border-soft" : "dark:bg-kite-bg border-kite-border-soft"/g,
  `(currentView === "data-analysis" || currentView === "businesses" || currentView === "investors") ? "dark:bg-[#1c2a37] dark:border-transparent " + (currentView === "businesses" ? "border-transparent" : "border-kite-border-soft") : "dark:bg-kite-bg border-kite-border-soft"`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx bg");
