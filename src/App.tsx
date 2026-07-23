/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useLayoutEffect, useRef } from"react";
import { AppProvider } from "./utils/AppContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { View } from"./types";
import TopNav from"./components/TopNav";
import BusinessSidebar from"./components/BusinessSidebar";
import MobileBottomNav from"./components/MobileBottomNav";
import Dashboard from"./pages/Dashboard";
import DataAnalysis from"./pages/DataAnalysis";
import Businesses from"./pages/Businesses";
import Investors from"./pages/Investors";
import Investments from"./pages/Investments";
import MyPnL from"./pages/MyPnL";
import AdminPage from"./pages/AdminPage";
import Bids from "./pages/Bids";
import { Menu, X, WifiOff, Sun, Moon, Laptop } from"lucide-react";
import { useTheme } from"./utils/ThemeContext";
import { Logo } from "./components/Logo";
import Login from "./components/Login";

import { useAppContext } from"./utils/AppContext";
import { MOCK_BUSINESSES } from"./utils/mockData";
import {
  MarketSimulationProvider,
  useMarketSimulation,
} from"./utils/MarketSimulationContext";

function GlobalMarketAlerts() {
  const { marketState, removeAlert } = useMarketSimulation();
  if (marketState.alerts.length === 0) return null;
  return (
    <div className="fixed top-2 md:p-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {marketState.alerts.map((alert) => (
        <div
          key={alert.id}
          className={`pointer-events-auto flex items-start gap-1.5 md:p-3 p-2 md:p-4 rounded-sm border w-80 translate-x-0 transition-transform ${
            alert.type ==="shock"
              ?"bg-red-900/90 text-[#DF514C] dark:text-[#E25F5B]-50 border-red-700/50 backdrop-blur-md"
              :"bg-emerald-900/90 text-emerald-50 border-emerald-700/50 backdrop-blur-md"
          }`}
        >
          <div className="flex-1 text-sm font-medium leading-snug">
            {alert.message}
          </div>
          <button
            onClick={() => removeAlert(alert.id)}
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme ==="light") setTheme("dark");
    else if (theme ==="dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button className="font-medium hover:text-kite-blue transition-colors" onClick={cycleTheme} > {theme ==="light" ? ( <Sun className="w-5 h-5" /> ) : theme ==="dark" ? ( <Moon className="w-5 h-5" /> ) : ( <Laptop className="w-5 h-5" /> )} </button>
  );
}

function MainLayout() {
  const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return "data-analysis";
    }
    return "dashboard";
  });

  const { state, dispatch } = useAppContext();

  // Keyboard Shortcuts Mapping
  useKeyboardShortcuts({
    'ctrl+s': () => {
      console.log('Saved data (Placeholder for Ctrl+S)');
    },
    'ctrl+k': () => {
      console.log('Open search (Placeholder for Ctrl+K)');
    },
    'shift+enter': () => {
      console.log('Performed Shift+Enter action');
    }
  });

  // Scroll preservation for main tabs
  const scrollPositions = useRef<{ [key: string]: number }>({});
  const mainRef = useRef<HTMLElement | null>(null);

  const handleNavigate = (newView: View) => {
    if (!mainRef.current) mainRef.current = document.querySelector("main");
    if (mainRef.current) {
      scrollPositions.current[currentView] = mainRef.current.scrollTop;
    }
    setCurrentView(newView);
  };

  useLayoutEffect(() => {
    if (!mainRef.current) mainRef.current = document.querySelector("main");
    if (mainRef.current) {
      mainRef.current.scrollTop = scrollPositions.current[currentView] || 0;
    }
  }, [currentView]);

  // Removed one-time migration to prevent unintended repeated Firestore writes and reads on mount.

  const renderView = () => {
    switch (currentView) {
      case"dashboard":
        return <Dashboard />;
      case"data-analysis":
        return <DataAnalysis onNavigate={handleNavigate} />;
      case"businesses":
        return <Businesses />;
      case"investors":
        return <Investors />;
      case"investments":
        return <Investments />;
      case"pnl":
        return <MyPnL />;
      case"bids":
        return <Bids />;
      case"admin":
        return <AdminPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-kite-bg dark:md:bg-[#181818] text-kite-text flex flex-col overflow-hidden font-sans">
      <div className="w-full h-full flex flex-col bg-white dark:bg-kite-bg dark:md:bg-[#181818] relative overflow-hidden">
        <TopNav currentView={currentView} onNavigate={handleNavigate} />

        {/* Mobile Header - Kite Style */}
        <div 
          className={`md:hidden flex items-center justify-between px-4 pb-3 bg-white border-b shrink-0 z-40 fixed top-0 left-0 right-0 mobile-header-safe ${(currentView === "data-analysis" || currentView === "businesses" || currentView === "investors") ? "dark:bg-[#1c2a37] dark:border-transparent border-kite-border-soft" : "dark:bg-kite-bg border-kite-border-soft"}`}
        >
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => handleNavigate("admin")}
          >
            <Logo />
          </div>

          <ThemeToggleButton />
        </div>
        
        {/* Spacer for fixed header */}
        <div 
          className="md:hidden flex items-center justify-between px-4 pb-3 opacity-0 pointer-events-none shrink-0 mobile-header-safe"
          aria-hidden="true"
        >
          <div className="flex flex-col">
            <Logo />
          </div>
          <div className="w-5 h-5"></div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Desktop Sidebar (Marketwatch) */}
          <div className="hidden md:flex flex-col bg-white dark:bg-kite-bg shrink-0 w-[320px] lg:w-[410px] max-w-[45vw] border-r border-kite-border z-[100] sidebar-container">
            <BusinessSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden flex flex-col bg-white dark:bg-kite-bg text-kite-text relative main-container">
            <div className="w-full px-0 py-0 pb-20 md:px-0 md:py-0 md:pb-8 lg:px-0 lg:py-0">
              <div
                style={{ display: currentView === "dashboard" ? "block" : "none" }}
              >
              <Dashboard />
            </div>
          <div
            style={{
              display: currentView ==="data-analysis" ?"block" :"none",
            }}
          >
            <DataAnalysis onNavigate={handleNavigate} />
          </div>
          <div
            style={{ display: currentView ==="businesses" ?"block" :"none" }}
          >
            <Businesses />
          </div>
          <div
            style={{ display: currentView ==="investors" ?"block" :"none" }}
          >
            <Investors />
          </div>
          <div
            style={{
              display: currentView ==="investments" ?"block" :"none",
            }}
          >
            <Investments />
          </div>
          <div style={{ display: currentView ==="pnl" ?"block" :"none" }}>
            <MyPnL />
          </div>
          <div style={{ display: currentView === "bids" ? "block" : "none" }}>
            <Bids />
          </div>
          <div style={{ display: currentView ==="admin" ?"block" :"none" }}>
            <AdminPage />
          </div>
        </div>
      </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-kite-bg border-t border-kite-border flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] footer-nav">
        <MobileBottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}

export default function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-kite-red/10 flex items-center justify-center font-sans text-kite-text p-4">
        <div className="bg-white dark:bg-kite-surface p-2 md:p-4 md:p-8 rounded-sm md:rounded max-w-md w-full text-center border-t-8 border-red-500">
          <WifiOff className="w-10 h-10 md:w-16 md:h-16 mx-auto text-[#DF514C] dark:text-[#E25F5B] mb-3 md:mb-6" />
          <h1 className="text-xs md:text-base font-medium text-kite-text mb-4 tracking-tight">
            No Internet Connection
          </h1>
          <p className="text-kite-text-light font-medium mb-4 md:mb-8">
            This system requires an active WiFi or internet connection to
            function. Please reconnect to access the module.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-medium text-[#DF514C] dark:text-[#E25F5B] bg-kite-red/10 py-3 rounded-sm">
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
        <AuthWrapper />
      </MarketSimulationProvider>
    </AppProvider>
  );
}

function AuthWrapper() {
  const { state, dispatch } = useAppContext();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Immediate check for saved ID to avoid flicker if possible
    const savedUserId = localStorage.getItem("loggedInUserId");
    const lastLoginTime = localStorage.getItem("lastLoginTime");
    const isDesktop = window.innerWidth >= 768;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (savedUserId === "admin" && !state.currentUser) {
       if (isDesktop && (!lastLoginTime || now - parseInt(lastLoginTime) > twentyFourHours)) {
          // Do not auto-login
       } else {
          dispatch({ type: "SET_CURRENT_USER", payload: { id: "admin", userId: "admin", name: "Admin", email: "admin@app", role: "CEO" } as any });
       }
    }
  }, []);

  useEffect(() => {
    if (!state.loading && state.usersLoaded) {
       const savedUserId = localStorage.getItem("loggedInUserId");
       const lastLoginTime = localStorage.getItem("lastLoginTime");
       if (savedUserId && savedUserId !== "admin") {
         const user = state.users.find(u => u.id === savedUserId || u.userId === savedUserId);
         if (user) {
           const isDesktop = window.innerWidth >= 768;
           const now = Date.now();
           const twentyFourHours = 24 * 60 * 60 * 1000;
           
           if (isDesktop && (!lastLoginTime || now - parseInt(lastLoginTime) > twentyFourHours)) {
              // Needs 2FA. Do not auto login. Let Login page handle it.
           } else {
             dispatch({ type: "SET_CURRENT_USER", payload: user });
           }
         } else {
           localStorage.removeItem("loggedInUserId");
           localStorage.removeItem("lastLoginTime");
           if (state.currentUser && state.currentUser.id !== "admin") {
             dispatch({ type: "SET_CURRENT_USER", payload: null });
           }
         }
       } else if (savedUserId === "admin") {
           const isDesktop = window.innerWidth >= 768;
           const now = Date.now();
           const twentyFourHours = 24 * 60 * 60 * 1000;
           if (isDesktop && (!lastLoginTime || now - parseInt(lastLoginTime) > twentyFourHours)) {
              // Needs 2FA.
              if (state.currentUser) {
                  dispatch({ type: "SET_CURRENT_USER", payload: null });
              }
           } else {
              // Checked by immediate effect usually, but just in case
           }
       }
       setIsChecking(false);
    }
  }, [state.loading, state.usersLoaded, state.users]);

  const handleLogin = (userId: string) => {
    localStorage.setItem("loggedInUserId", userId);
    localStorage.setItem("lastLoginTime", Date.now().toString());
    if (userId === "admin") {
      dispatch({ type: "SET_CURRENT_USER", payload: { id: "admin", userId: "admin", name: "Admin", email: "admin@app", role: "CEO" } as any });
    } else {
      const user = state.users.find(u => u.id === userId || u.userId === userId);
      if (user) dispatch({ type: "SET_CURRENT_USER", payload: user });
    }
  };

  if (state.loading || isChecking) {
    return (
      <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-white dark:bg-kite-bg z-50">
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
          <div className="flex items-center gap-3 md:gap-5">
            <img 
              src="/logo.svg" 
              alt="Radhika" 
              className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-sm"
            />
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-black dark:text-white">
              Radhika
            </h1>
          </div>
          
          {/* Mobile Progress Bar (hidden on md) */}
          <div className="md:hidden w-40 h-[2px] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            <div className="h-full bg-kite-blue w-full origin-left animate-progress-indeterminate"></div>
          </div>

          {/* Desktop Dots (hidden on sm) */}
          <div className="hidden md:flex items-center justify-center space-x-2.5">
            <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-1"></div>
            <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-2"></div>
            <div className="w-2.5 h-2.5 bg-kite-text dark:bg-kite-text-light rounded-full animate-dot-3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return <MainLayout />;
}
