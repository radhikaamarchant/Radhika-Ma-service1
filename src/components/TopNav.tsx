import { useState, useEffect } from "react";
import { View } from "../types";
import {
  Building2,
  Users,
  ReceiptIndianRupee,
  LayoutDashboard,
  PieChart,
  Sun,
  Moon,
  Laptop,
  BadgeCheck,
} from "lucide-react";
import { useTheme } from "../utils/ThemeContext";
import { Logo } from "./Logo";
import { initAuth } from "../utils/firebase";
import { useAppContext } from "../utils/AppContext";

interface TopNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function TopNav({ currentView, onNavigate }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const [adminName, setAdminName] = useState("Radhika Marchant");
  const [adminPhoto, setAdminPhoto] = useState<string | null>(null);

  useEffect(() => {
    const unsub = initAuth();

    const saved = localStorage.getItem("adminProfile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setAdminName(parsed.name);
        if (parsed.photoUrl) setAdminPhoto(parsed.photoUrl);
      } catch (e) {}
    }

    const handleStorage = () => {
      const savedProfile = localStorage.getItem("adminProfile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name) setAdminName(parsed.name);
          if (parsed.photoUrl) setAdminPhoto(parsed.photoUrl);
          else setAdminPhoto(null);
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("adminProfileUpdated", handleStorage);
    return () => {
      if(unsub) unsub();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("adminProfileUpdated", handleStorage);
    };
  }, []);

  const navItems = [
    { id: "dashboard" as View, label: "Dashboard" },
    { id: "data-analysis" as View, label: "Analysis" },
    { id: "businesses" as View, label: "Businesses" },
    { id: "investors" as View, label: "Investors" },
    { id: "investments" as View, label: "Investments" },
    { id: "pnl" as View, label: "MY P&L" },
  ];

  return (
    <header className="hidden md:flex h-[55px] border-b border-kite-border bg-[#F8F9FA] dark:bg-kite-bg items-center justify-between px-6 shrink-0 z-[110]">
      <div className="flex items-center space-x-2">
        <div className="flex flex-col cursor-pointer" onClick={() => onNavigate("admin")}>
          <Logo />
        </div>
      </div>

      <nav className="flex items-center space-x-6 h-full">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 h-full border-b-2 transition-colors ${
                isActive
                  ? "border-kite-blue text-kite-blue lg:border-[#FF6D2D] lg:text-[#FF6D2D]"
                  : "border-transparent text-kite-text hover:text-kite-text dark:hover:text-white lg:hover:text-[#FF8148]"
              }`}
            >
              <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}

        <div className="w-px h-6 bg-kite-border mx-2"></div>

        {/* Theme toggler */}
        <div className="flex bg-kite-surface p-0.5 rounded-sm border border-kite-border shadow-inner space-x-0.5 mr-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-1 flex justify-center items-center rounded-[2px] transition-all ${
              theme === "light"
                ? "bg-gray-100 dark:bg-kite-border-soft text-kite-text dark:text-white"
                : "text-kite-text-light hover:text-kite-text"
            }`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-1 flex justify-center items-center rounded-[2px] transition-all ${
              theme === "system"
                ? "bg-gray-100 dark:bg-kite-border-soft text-kite-text dark:text-white"
                : "text-kite-text-light hover:text-kite-text"
            }`}
            title="System Mode"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-1 flex justify-center items-center rounded-[2px] transition-all ${
              theme === "dark"
                ? "bg-gray-100 dark:bg-kite-border-soft text-kite-text dark:text-white"
                : "text-kite-text-light hover:text-kite-text"
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Admin Profile */}
        <div
          onClick={() => onNavigate("admin")}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-kite-border-soft text-kite-text flex items-center justify-center font-medium text-[11px] border border-kite-border uppercase overflow-hidden">
            {adminPhoto ? (
              <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              adminName.substring(0, 2)
            )}
          </div>
          <div className="hidden lg:block">
            <p className={`text-[12px] font-medium truncate ${currentView === "admin" ? "text-kite-blue" : "text-kite-text group-hover:text-kite-text dark:group-hover:text-white"}`}>
              {adminName}
            </p>
          </div>
        </div>
      </nav>
    </header>
  );
}
