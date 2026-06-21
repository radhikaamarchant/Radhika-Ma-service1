/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppProvider } from './utils/AppContext';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataAnalysis from './pages/DataAnalysis';
import Businesses from './pages/Businesses';
import Investors from './pages/Investors';
import Investments from './pages/Investments';
import Banking from './pages/Banking';
import MyPnL from './pages/MyPnL';
import { Menu, X, WifiOff } from 'lucide-react';

import { useAppContext } from './utils/AppContext';
import { MOCK_BUSINESSES } from './utils/mockData';

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

function MainLayout() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state, dispatch } = useAppContext();

  // One-time migration to assign authority types to the 8 specific companies and give them subsidies
  useEffect(() => {
    if (!state.loading) {
      const idsToDelete = ['40001', '40002', '40003', '40004', '40005', '40006', '40007', '40008'];
      const targetValidIds = ['171633', '917487', '958675', '410714', '702034', '729230', '864541', '555918'];

      state.businesses.forEach(b => {
        // Delete the duplicate mock businesses
        if (idsToDelete.includes(b.businessId)) {
          dispatch({ type: 'DELETE_BUSINESS', payload: b.id });
        } 
        // Update the requested original businesses
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
              authType = 'Business Authorities'; 
            }
            needsUpdate = true;
          }

          // Force update subsidy to 4% (only if they are Trust/Govt, as per user rule, 
          // or if the user wants it on all 8, let's apply it carefully based on authority type.)
          if ((authType === 'Trust Authorities' || authType === 'Government Authorities') && newSubsidy !== 4) {
             newSubsidy = 4;
             needsUpdate = true;
          } else if (authType === 'Business Authorities' && newSubsidy !== 0) {
             newSubsidy = 0;
             needsUpdate = true;
          }

          if (needsUpdate) {
            dispatch({ 
              type: 'UPDATE_BUSINESS', 
              payload: { ...b, authorityType: authType as any, rmasSubsidy: newSubsidy } 
            });
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
      case 'banking': return <Banking />;
      case 'pnl': return <MyPnL />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
        <div>
           <h1 className="text-xl tracking-tight text-black flex items-center flex-wrap">
             RADHIKA MA<span className="text-blue-600 ml-2">SERVICE</span>
           </h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:text-black">
           <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out shrink-0 w-64 border-r border-gray-200`}>
         <div className="h-full bg-white flex flex-col">
           {isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-black z-50">
               <X size={20} />
             </button>
           )}
           <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} />
         </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden flex flex-col items-start bg-gray-50">
        <div className="p-4 md:p-8 w-full max-w-full">
           {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center font-sans text-black p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-red-500">
          <WifiOff size={64} className="mx-auto text-red-500 mb-6" />
          <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">No Internet Connection</h1>
          <p className="text-gray-600 font-medium mb-8">
            This system requires an active WiFi or internet connection to function. Please reconnect to access the module.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-bold text-red-600 bg-red-50 py-3 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>Waiting for connection...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
