import { useState, useEffect } from 'react';
import { Building2, Users, ReceiptIndianRupee, LayoutDashboard, CreditCard, PieChart, Layers, Lock, ShieldCheck } from 'lucide-react';
import { View } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const allNavItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-analysis' as View, label: 'Data Analysis', icon: PieChart },
    { id: 'businesses' as View, label: 'Businesses', icon: Building2 },
    { id: 'investors' as View, label: 'Investors', icon: Users },
    { id: 'investments' as View, label: 'Investments', icon: ReceiptIndianRupee },
    { id: 'banking' as View, label: 'Banking', icon: CreditCard },
    { id: 'pnl' as View, label: 'MY P&L', icon: PieChart },
  ];

  const navItems = isOtherMode 
    ? allNavItems.filter(item => item.id === 'data-analysis' || item.id === 'investments')
    : allNavItems;

  const handleProfileClick = () => {
    if (isOtherMode) {
      setShowOtp(true);
      simulateOtp();
    }
  };

  const simulateOtp = () => {
    const correctOtp = ['8', '2', '4', '9'];
    setOtpValues(['', '', '', '']);
    setOtpSuccess(false);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < 4) {
        setOtpValues(prev => {
          const next = [...prev];
          next[currentStep] = correctOtp[currentStep];
          return next;
        });
        currentStep++;
      } else {
        clearInterval(interval);
        setOtpSuccess(true);
        setTimeout(() => {
          setShowOtp(false);
          setIsOtherMode(false);
        }, 1200); // Wait briefly to show success state before closing
      }
    }, 450); // 450ms per digit for a premium feeling typing effect
  };

  return (
    <div className="w-64 h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black break-words">
            RADHIKA MA<br/>SERVICE
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Secure Invest</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-semibold
                ${isActive 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 mt-auto space-y-3">
        {!isOtherMode && (
          <button 
            onClick={() => setIsOtherMode(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-100"
          >
            <Layers size={16} className="text-gray-500" />
            <span>Other</span>
          </button>
        )}
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
          onClick={handleProfileClick}
          title={isOtherMode ? "Unlock full dashboard" : ""}
        >
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
            RM
          </div>
          <div className="text-sm">
            <p className="font-semibold text-black">Radhika M</p>
            <p className="text-xs text-gray-500 font-medium">chif cmp</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showOtp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-6 max-w-[280px] sm:max-w-[320px] w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
            >
              {otpSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black text-white flex flex-col items-center justify-center z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                  >
                    <ShieldCheck size={56} className="text-green-400 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold tracking-tight">Access Granted</h3>
                  <p className="text-sm text-gray-400 mt-2">Restoring dashboard state</p>
                </motion.div>
              )}

              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                <Lock size={20} className="text-black" />
              </div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
                Admin Authentication
              </h2>
              <p className="text-xs text-gray-500 mb-6 font-medium">
                Enter master PIN to unlock full dashboard access.
              </p>

              <div className="flex space-x-2 mb-6">
                {otpValues.map((digit, idx) => (
                  <motion.div 
                    key={idx}
                    initial={false}
                    animate={{ 
                      scale: digit ? [1, 1.1, 1] : 1,
                      borderColor: digit ? '#000' : '#e5e7eb',
                      backgroundColor: digit ? '#000' : '#fff'
                    }}
                    className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-black ${
                      digit ? 'text-white' : 'text-transparent'
                    }`}
                  >
                    {digit || '0'}
                  </motion.div>
                ))}
              </div>
              
              <div className="w-full">
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-black rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(otpValues.filter(v => v !== '').length / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs font-bold text-gray-400 mt-3 tracking-widest uppercase">
                  Verifying Identity...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
