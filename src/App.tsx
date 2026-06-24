/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { AppProvider } from './utils/AppContext';
import { View } from './types';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Dashboard from './pages/Dashboard';
import DataAnalysis from './pages/DataAnalysis';
import Businesses from './pages/Businesses';
import Investors from './pages/Investors';
import Investments from './pages/Investments';
import MyPnL from './pages/MyPnL';
import AdminPage from './pages/AdminPage';
import { Menu, X, WifiOff, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './utils/ThemeContext';

import { useAppContext } from './utils/AppContext';
import { MOCK_BUSINESSES } from './utils/mockData';
import { MarketSimulationProvider, useMarketSimulation } from './utils/MarketSimulationContext';

function GlobalMarketAlerts() {
 const { marketState, removeAlert } = useMarketSimulation();
 if (marketState.alerts.length === 0) return null;
 return (
 <div className="fixed top-2 md:p-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
 {marketState.alerts.map(alert => (
 <div key={alert.id}
 className={`pointer-events-auto flex items-start gap-1.5 md:p-3 p-2 md:p-4 rounded-sm border w-80 translate-x-0 transition-transform ${
 alert.type === 'shock' ? 'bg-red-900/90 text-red-50 border-red-700/50 backdrop-blur-md'
 : 'bg-emerald-900/90 text-emerald-50 border-emerald-700/50 backdrop-blur-md'
 }`}
 >
 <div className="flex-1 text-sm font-medium leading-snug">
 {alert.message}
 </div>
 <button onClick={() => removeAlert(alert.id)}
 className="text-kite-text/50 hover:text-kite-text shrink-0 p-1"
 >
 <X className="w-3 md:w-4 h-3 md:h-4" />
 </button>
 </div>
 ))}
 </div>
 );
}

function useOnlineStatus() {
 const [isOnline, setIsOnline] = useState(navigator.onLine);

 useEffect(() => {
 const handleOnline = () => setIsOnline(true);
 const handleOffline = () => setIsOnline(false);

 window.addEventListener('online', handleOnline);
 window.addEventListener('offline', handleOffline);

 return () => {
 window.removeEventListener('online', handleOnline);
 window.removeEventListener('offline', handleOffline);
 };
 }, []);

 return isOnline;
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
  
  return (
    <button onClick={cycleTheme} className="p-2 rounded-full hover:bg-kite-bg text-kite-text-light hover:text-black transition-colors">
      {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
    </button>
  );
}

function MainLayout() {
 const [currentView, setCurrentView] = useState<View>('dashboard');
 
 const { state, dispatch } = useAppContext();

 // Scroll preservation for main tabs
 const scrollPositions = useRef<{ [key: string]: number }>({});
 const mainRef = useRef<HTMLElement | null>(null);

 const handleNavigate = (newView: View) => {
   if (!mainRef.current) mainRef.current = document.querySelector('main');
   if (mainRef.current) {
     scrollPositions.current[currentView] = mainRef.current.scrollTop;
   }
   setCurrentView(newView);
 };

 useEffect(() => {
   if (!mainRef.current) mainRef.current = document.querySelector('main');
   if (mainRef.current) {
     setTimeout(() => {
       if (mainRef.current) mainRef.current.scrollTop = scrollPositions.current[currentView] || 0;
     }, 10);
   }
 }, [currentView]);

 // One-time migration to assign authority types to the 8 specific companies and give them subsidies
 useEffect(() => {
 if (!state.loading) {
 const idsToDelete = ['40001', '40002', '40003', '40004', '40005', '40006', '40007', '40008'];
 const targetValidIds = ['171633', '917487', '958675', '410714', '702034', '729230', '864541', '555918'];

 state.businesses.forEach(b => {
 // Delete the duplicate mock businesses
 if (idsToDelete.includes(b.businessId)) {
 dispatch({ type: 'DELETE_BUSINESS', payload: b.id });
 } // Update the requested original businesses
 else if (targetValidIds.includes(b.businessId)) {
 let authType = b.authorityType;
 let newSubsidy = b.rmasSubsidy;
 let needsUpdate = false;

 const lName = b.name.toLowerCase();
 if (!authType) {
 if (lName.includes('trust') || lName.includes('hospital')) {
 authType = 'Trust Authorities';
 } else if (lName.includes('muncipal') || lName.includes('corporation')) {
 authType = 'Government Authorities';
 } else {
 authType = 'Business Authorities'; }
 needsUpdate = true;
 }

 // Force update subsidy to 4% (only if they are Trust/Govt, as per user rule, // or if the user wants it on all 8, let's apply it carefully based on authority type.)
 if ((authType === 'Trust Authorities' || authType === 'Government Authorities') && newSubsidy !== 4) {
 newSubsidy = 4;
 needsUpdate = true;
 } else if (authType === 'Business Authorities' && newSubsidy !== 0) {
 newSubsidy = 0;
 needsUpdate = true;
 }

 if (needsUpdate) {
 dispatch({ type: 'UPDATE_BUSINESS', payload: { ...b, authorityType: authType as any, rmasSubsidy: newSubsidy } });
 }
 }
 });
 }
 // Deliberately isolated from state.businesses dependency to prevent refire loops
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [state.loading]);


 const renderView = () => {
 switch (currentView) {
 case 'dashboard': return <Dashboard />;
 case 'data-analysis': return <DataAnalysis />;
 case 'businesses': return <Businesses />;
 case 'investors': return <Investors />;
 case 'investments': return <Investments />;
 case 'pnl': return <MyPnL />;
 case 'admin': return <AdminPage />;
 default: return <Dashboard />;
 }
 };

 return (
 <div className="h-screen bg-kite-bg text-kite-text flex flex-col md:flex-row overflow-hidden pb-14 md:pb-0 font-sans">
 {/* Desktop Sidebar */}
 <div className="hidden md:flex flex-col bg-white shrink-0 w-[260px] border-r border-kite-border z-[100]">
   <Sidebar currentView={currentView} onNavigate={handleNavigate} />
 </div>

 {/* Mobile Header - Kite Style */}
  <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-kite-border shrink-0 z-40 sticky top-0">
    <div className="flex flex-col">
      <span className="text-[15px] text-black font-bold tracking-wide">Radhika MA Service</span>
      <span className="text-[10px] text-kite-text-light font-medium tracking-wide mt-0.5">MyRadhika softwere</span>
    </div>
    
    <ThemeToggleButton />
  </div>

 {/* Main Content */}
 <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden flex flex-col items-center bg-kite-bg text-kite-text relative">
   <div className="w-full max-w-full">
     <div style={{ display: currentView === 'dashboard' ? 'block' : 'none' }}><Dashboard /></div>
     <div style={{ display: currentView === 'data-analysis' ? 'block' : 'none' }}><DataAnalysis /></div>
     <div style={{ display: currentView === 'businesses' ? 'block' : 'none' }}><Businesses /></div>
     <div style={{ display: currentView === 'investors' ? 'block' : 'none' }}><Investors /></div>
     <div style={{ display: currentView === 'investments' ? 'block' : 'none' }}><Investments /></div>
     <div style={{ display: currentView === 'pnl' ? 'block' : 'none' }}><MyPnL /></div>
     <div style={{ display: currentView === 'admin' ? 'block' : 'none' }}><AdminPage /></div>
   </div>
 </main>
 
 {/* Mobile Bottom Navigation */}
 <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-kite-border flex justify-between items-center z-[100] pb-safe-[0_-2px_10px_rgba(0,0,0,0.02)]">
   <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />
 </div>

 </div>
 );
}

export default function App() {
 const isOnline = useOnlineStatus();

 if (!isOnline) {
 return (
 <div className="min-h-screen bg-kite-red/10 flex items-center justify-center font-sans text-kite-text p-4">
 <div className="bg-white p-2 md:p-4 md:p-8 rounded-sm md:rounded max-w-md w-full text-center border-t-8 border-red-500">
 <WifiOff  className="w-10 h-10 md:w-16 md:h-16 mx-auto text-kite-red mb-3 md:mb-6" />
 <h1 className="text-xs md:text-base font-medium text-kite-text mb-4 tracking-tight">No Internet Connection</h1>
 <p className="text-kite-text-light font-medium mb-4 md:mb-8">
 This system requires an active WiFi or internet connection to function. Please reconnect to access the module.
 </p>
 <div className="flex items-center justify-center space-x-2 text-sm font-medium text-kite-red bg-kite-red/10 py-3 rounded-sm">
 <span className="w-2 h-2 rounded-full bg-kite-red animate-pulse"></span>
 <span>Waiting for connection...</span>
 </div>
 </div>
 </div>
 );
 }

 return (
 <AppProvider>
 <MarketSimulationProvider>
 <MainLayout />
 </MarketSimulationProvider>
 </AppProvider>
 );
}
