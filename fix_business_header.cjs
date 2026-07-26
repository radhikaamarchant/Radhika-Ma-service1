const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
  '${currentView === "businesses" ? "bg-[#f2f2f2]" : currentView === "investors" ? "bg-[#ececed]" : "bg-white"}',
  '${currentView === "businesses" ? "bg-[#ececed]" : currentView === "investors" ? "bg-[#ececed]" : "bg-white"}'
);
fs.writeFileSync('src/App.tsx', appContent);

// 2. Update Businesses.tsx
let bizContent = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');
bizContent = bizContent.replace(
  '<div className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-[#1c2a37] dark:md:bg-[#181818] w-full md:hidden pt-3 px-4 pb-3">',
  '<div className="sticky top-0 z-30 bg-[#ececed] dark:bg-[#1c2a37] dark:md:bg-[#181818] w-full md:hidden pt-3 px-4 pb-3">'
);
fs.writeFileSync('src/pages/Businesses.tsx', bizContent);

// 3. Update index.css
let cssContent = fs.readFileSync('src/index.css', 'utf-8');
if (!cssContent.includes('body.business-detail-open .mobile-header-safe')) {
  cssContent += `\nbody.business-detail-open .mobile-header-safe {\n  background-color: #ffffff !important;\n}\nhtml.dark body.business-detail-open .mobile-header-safe {\n  background-color: var(--kite-bg) !important;\n}\n`;
  fs.writeFileSync('src/index.css', cssContent);
}

console.log("Updated files");
