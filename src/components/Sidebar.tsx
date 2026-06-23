import { useState } from 'react';
import { View } from '../types';
import { Building2, Users, ReceiptIndianRupee, LayoutDashboard, CreditCard, PieChart, Sun, Moon, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../utils/ThemeContext';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-analysis' as View, label: 'Data Analysis', icon: PieChart },
    { id: 'businesses' as View, label: 'Businesses', icon: Building2 },
    { id: 'investors' as View, label: 'Investors', icon: Users },
    { id: 'investments' as View, label: 'Investments', icon: ReceiptIndianRupee },
    { id: 'pnl' as View, label: 'MY P&L', icon: PieChart },
  ];

  return (
    <div className="w-[260px] h-full border-r border-kite-border bg-white flex flex-col">
      <div className="p-4 border-b border-kite-border flex items-center h-[55px]">
        <div className="flex flex-col justify-center">
          <span className="text-[15px] text-black font-bold tracking-wide">Radhika MA Service</span>
          <span className="text-[10px] text-kite-text-light font-medium tracking-wide mt-0.5">MyRadhika softwere</span>
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[10px] uppercase font-medium text-kite-text-light tracking-wider px-2">Apps</p>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-2.5 transition-colors text-[13px] font-medium relative group
                ${isActive ? 'text-black' : 'text-kite-text hover:text-black'}
              `}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSidebar"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-black"
                />
              )}
              <Icon strokeWidth={isActive ? 2 : 1.5} className={`w-[18px] h-[18px] ${isActive ? 'text-black' : 'text-kite-text-light group-hover:text-black'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-kite-border">
        
        {/* Theme Toggler */}
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-[10px] uppercase font-medium text-kite-text-light tracking-wider">Appearance</span>
          <div className="flex bg-kite-bg p-1 rounded-sm border border-kite-border/50 shadow-inner space-x-1">
            <button onClick={() => setTheme('light')} className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme === 'light' ? 'bg-white shadow border border-kite-border text-black' : 'hover:bg-gray-100 text-kite-text-light hover:text-kite-text'}`} title="Light Mode">
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTheme('system')} className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme === 'system' ? 'bg-white shadow border border-kite-border text-black' : 'hover:bg-gray-100 text-kite-text-light hover:text-kite-text'}`} title="System Mode">
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTheme('dark')} className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme === 'dark' ? 'bg-white shadow border border-kite-border text-black' : 'hover:bg-gray-100 text-kite-text-light hover:text-kite-text'}`} title="Dark Mode">
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 hover:bg-kite-bg p-2 -mx-2 rounded-sm transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-black flex items-center justify-center font-semibold text-xs border border-gray-200">
            RM
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-kite-text group-hover:text-black truncate">Radhika M</p>
            <p className="text-[10px] text-kite-text-light truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
