import { View } from"../types";
import { Bookmark, Gavel, User, Briefcase } from"lucide-react";
import { useAppContext } from "../utils/AppContext";
import { triggerSelectionHaptic } from "../utils/haptics";

interface MobileBottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}
export default function MobileBottomNav({
  currentView,
  onNavigate,
}: MobileBottomNavProps) {
  // Mobile only requested buttons
  const { state } = useAppContext();
  const navItems = [
    { id:"data-analysis" as View, label:"Analysis", icon: Bookmark },
    { id:"businesses" as View, label:"Businesses", icon: Gavel },
    { id:"investors" as View, label:"Investors", icon: User },
    { id:"investments" as View, label:"Investments", icon: Briefcase },
    { id:"admin" as View, label: (state.currentUser?.userId || (state.currentUser?.id === "admin" ? "admin" : "Profile")).toUpperCase(), icon: User },
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
            onClick={() => {
              triggerSelectionHaptic();
              onNavigate(item.id);
            }}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 ${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B] hover:text-[#9B9B9B] dark:hover:text-[#9B9B9B]"}`}
          >
            <Icon
              className={`w-[20px] h-[20px] ${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B]"}`}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span
              className={`text-[10px] font-medium tracking-wide ${isActive ?"text-[#4184F3] dark:text-[#4184F3]" :"text-[#9B9B9B] dark:text-[#9B9B9B]"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}{""}
    </>
  );
}
