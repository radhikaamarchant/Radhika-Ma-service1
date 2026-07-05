import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import Bids from "./pages/Bids";')) {
  content = content.replace('import AdminPage from"./pages/AdminPage";', 'import AdminPage from"./pages/AdminPage";\nimport Bids from "./pages/Bids";');
}

if (!content.includes('case "bids":')) {
  content = content.replace('case "admin":', 'case "bids":\n        return <Bids />;\n      case "admin":');
}

if (!content.includes('currentView === "bids"')) {
  content = content.replace('<div style={{ display: currentView === "admin" ? "block" : "none" }}>', '<div style={{ display: currentView === "bids" ? "block" : "none" }}>\n            <Bids />\n          </div>\n          <div style={{ display: currentView === "admin" ? "block" : "none" }}>');
}

fs.writeFileSync('src/App.tsx', content);
