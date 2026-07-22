import { useState, useEffect } from"react";
import { View } from"../types";
import {
  Building2,
  Users,
  ReceiptIndianRupee,
  LayoutDashboard,
  CreditCard,
  PieChart,
  Sun,
  Moon,
  Laptop,
  BadgeCheck,
} from"lucide-react";
import { motion } from"framer-motion";
import { useTheme } from "../utils/ThemeContext";
import { useAppContext } from "../utils/AppContext";
import { Logo } from "./Logo";
interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}
export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  
  const { state } = useAppContext();
  const adminName = state.currentUser ? state.currentUser.name : "Admin";
  const adminPhoto = state.currentUser ? state.currentUser.photoUrl : null;
  const role = state.currentUser ? state.currentUser.role : "Admin";
  
  const navItems = [
    { id: "dashboard" as View, label: "Dashboard" },
    { id: "businesses" as View, label: "Businesses" },
    { id: "investors" as View, label: "Investors" },
    { id: "investments" as View, label: "Investments" },
    { id: "pnl" as View, label: "MY P&L" },
  ];
  return (
    <div className="w-[260px] h-full border-r border-kite-border bg-[#F8F9FA] dark:bg-kite-bg dark:md:bg-[#181818] flex flex-col">
      <div className="p-4 border-b border-kite-border flex items-center h-[55px]">
        <div className="flex flex-col justify-center">
          <Logo />
        </div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[10px] md:text-[11px] uppercase font-medium text-kite-text-light tracking-wider px-2">
            Apps
          </p>
        </div>{""}
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-5 py-2.5 transition-colors text-[13px] md:text-[14px] font-medium relative group ${isActive ?"text-black dark:text-white" :"text-kite-text-light hover:text-black dark:hover:text-white"} `}
            >
              {""}
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-black dark:bg-white"
                />
              )}{""}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}{""}
      </nav>
      <div className="p-4 border-t border-kite-border">
        {""}
        {/* Theme Toggler */}{""}
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-[10px] md:text-[11px] uppercase font-medium text-kite-text-light tracking-wider">
            Appearance
          </span>
          <div className="flex bg-kite-bg p-1 rounded-sm border border-kite-border/50 shadow-inner space-x-1">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme ==="light" ?"bg-kite-surface shadow border border-kite-border text-black" :"hover:bg-gray-100 dark:md:hover:bg-[#131415] text-kite-text-light hover:text-kite-text"}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme ==="system" ?"bg-kite-surface shadow border border-kite-border text-black" :"hover:bg-gray-100 dark:md:hover:bg-[#131415] text-kite-text-light hover:text-kite-text"}`}
              title="System Mode"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 p-1.5 flex justify-center items-center rounded-sm transition-all ${theme ==="dark" ?"bg-kite-surface shadow border border-kite-border text-black" :"hover:bg-gray-100 dark:md:hover:bg-[#131415] text-kite-text-light hover:text-kite-text"}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div
          onClick={() => onNavigate("admin")}
          className={`flex items-center space-x-3 p-2 -mx-2 rounded-sm transition-colors cursor-pointer group ${currentView ==="admin" ?"bg-kite-blue/5 border-r-2 border-kite-blue text-kite-blue" :"hover:bg-kite-bg"}`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-kite-border-soft text-black flex items-center justify-center font-medium text-[11px] md:text-[12px] border border-kite-border uppercase overflow-hidden">
            {""}
            {adminPhoto ? (
              <img
                src={adminPhoto}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              adminName.substring(0, 2)
            )}{""}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p
                className={`text-[13px] md:text-[14px] font-medium truncate ${currentView ==="admin" ?"text-kite-blue" :"text-kite-text group-hover:text-black"}`}
              >
                {adminName}
              </p>
              <BadgeCheck
                className={`w-3.5 h-3.5 flex-shrink-0 ${currentView ==="admin" ?"text-kite-blue" :"text-blue-500"}`}
              />
            </div>
            <p
              className={`text-[10px] md:text-[11px] truncate ${currentView ==="admin" ?"text-kite-blue/70" :"text-kite-text-light"}`}
            >
              Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
