import { View } from"../types";
import { Bookmark, Gavel, User, Briefcase } from"lucide-react";
interface MobileBottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}
export default function MobileBottomNav({
  currentView,
  onNavigate,
}: MobileBottomNavProps) {
  // Mobile only requested buttons
  const navItems = [
    { id:"data-analysis" as View, label:"Analysis", icon: Bookmark },
    { id:"businesses" as View, label:"Businesses", icon: Gavel },
    { id:"investors" as View, label:"Investors", icon: User },
    { id:"investments" as View, label:"Investments", icon: Briefcase },
  ];
  return (
    <>
      {""}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 py-2 flex flex-col items-center justify-center space-y-1 ${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white hover:text-[#4A4A4A] dark:hover:text-white"}`}
          >
            <Icon
              className={`w-[22px] h-[22px] ${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white"}`}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span
              className={`text-[10px] md:text-[11px] font-medium tracking-wide ${isActive ?"text-[#4184F3] dark:text-kite-blue" :"text-[#4A4A4A] dark:text-white"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}{""}
    </>
  );
}
