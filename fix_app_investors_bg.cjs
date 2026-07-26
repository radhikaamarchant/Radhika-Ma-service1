const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update bg and border logic for mobile header in App.tsx to include investors
const oldHeader = /\`md:hidden flex items-center justify-between px-4 pb-3 \$\{currentView === "businesses" \? "bg-\\[#f2f2f2\\]" : "bg-white"\} border-b shrink-0 z-40 fixed top-0 left-0 right-0 mobile-header-safe \$\{\(currentView === "data-analysis" \|\| currentView === "businesses" \|\| currentView === "investors"\) \? "dark:bg-\\[#1c2a37\\] dark:border-transparent " \+ \(currentView === "businesses" \? "border-transparent" : "border-kite-border-soft"\) : "dark:bg-kite-bg border-kite-border-soft"\}\`/g;

const newHeader = `\`md:hidden flex items-center justify-between px-4 pb-3 \${currentView === "businesses" ? "bg-[#f2f2f2]" : currentView === "investors" ? "bg-[#ececed]" : "bg-white"} border-b shrink-0 z-40 fixed top-0 left-0 right-0 mobile-header-safe \${(currentView === "data-analysis" || currentView === "businesses" || currentView === "investors") ? "dark:bg-[#1c2a37] dark:border-transparent " + ((currentView === "businesses" || currentView === "investors") ? "border-transparent" : "border-kite-border-soft") : "dark:bg-kite-bg border-kite-border-soft"}\``;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx investors bg");
