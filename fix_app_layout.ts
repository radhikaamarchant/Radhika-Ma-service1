import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import Sidebar from '.\/components\/Sidebar';/g, "import Sidebar from './components/Sidebar';\nimport MobileBottomNav from './components/MobileBottomNav';");

// Remove isSidebarOpen state
content = content.replace(/const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\);/g, '');

// Replace MainLayout returning JSX with the new Mobile Layout
// From: return ( \n <div className="h-screen ... to the end of MainLayout

const newRender = `return (
 <div className="h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row overflow-hidden pb-14 md:pb-0">
 {/* Mobile Header - Kite Style */}
 <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-gray-100 shrink-0 z-40 sticky top-0 shadow-sm">
 <h1 className="text-sm font-semibold tracking-wide text-gray-800 uppercase flex items-center">
 <span className="text-blue-600 font-bold mr-1">RM</span> SERVICE
 </h1>
 </div>

 {/* Sidebar Container (Desktop only) */}
 <div className="hidden md:flex flex-col bg-gray-100 shrink-0 w-64 border-r border-gray-200">
   <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); }} />
 </div>

 {/* Main Content */}
 <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden flex flex-col items-start bg-gray-50 text-gray-900 relative">
   <div className="p-2 md:p-4 w-full max-w-full">
     {renderView()}
   </div>
 </main>
 
 {/* Mobile Bottom Navigation */}
 <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-between items-center z-[100] pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
   <MobileBottomNav currentView={currentView} onNavigate={setCurrentView} />
 </div>

 </div>
 );
}

export default function App() {`;

// Replace the end of MainLayout
const regex = /return \(\s*<div className="h-screen bg-gray-50[\s\S]*?export default function App\(\) \{/m;
content = content.replace(regex, newRender);

fs.writeFileSync('src/App.tsx', content, 'utf8');
