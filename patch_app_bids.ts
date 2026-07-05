import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!content.includes('import Bids from "./pages/Bids"')) {
  content = content.replace('import AdminPage from "./pages/AdminPage";', 'import AdminPage from "./pages/AdminPage";\nimport Bids from "./pages/Bids";');
}

// Add to renderView
if (!content.includes('case "bids":')) {
  content = content.replace('case "admin":', 'case "bids":\n        return <Bids />;\n      case "admin":');
}

// Add to styles
if (!content.includes('currentView === "bids"')) {
  content = content.replace('<div style={{ display: currentView === "admin" ? "block" : "none" }}>\n            <AdminPage />\n          </div>', '<div style={{ display: currentView === "bids" ? "block" : "none" }}>\n            <Bids />\n          </div>\n          <div style={{ display: currentView === "admin" ? "block" : "none" }}>\n            <AdminPage />\n          </div>');
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx for Bids");
