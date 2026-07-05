import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!content.includes('import Bids from "./pages/Bids"')) {
  content = content.replace('import AdminPage from "./pages/AdminPage";', 'import AdminPage from "./pages/AdminPage";\nimport Bids from "./pages/Bids";');
}

// Add to renderMobileView if it exists
if (!content.includes('case "bids":\n        return <Bids />;')) {
  content = content.replace('case "admin":', 'case "bids":\n        return <Bids />;\n      case "admin":');
}

// In the main return, it renders views using conditional displays, because of state persistence.
if (!content.includes('currentView === "bids"')) {
  content = content.replace('<div style={{ display: currentView === "admin" ? "block" : "none" }}>', '<div style={{ display: currentView === "bids" ? "block" : "none" }}>\n            <Bids />\n          </div>\n          <div style={{ display: currentView === "admin" ? "block" : "none" }}>');
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for Bids - 2");
