
import React from 'react';
import { LayoutDashboard, Briefcase, MessageSquare, Calendar, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PATHS } from '../../constants/paths';

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onToggleSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeView, onNavigate, onToggleSidebar }) => {
  const { theme } = useTheme();

  const navItems = [
    { id: PATHS.DASHBOARD, label: 'Home', icon: LayoutDashboard },
    { id: PATHS.CASES, label: 'Cases', icon: Briefcase },
    { id: PATHS.MESSAGES, label: 'Chats', icon: MessageSquare },
    { id: PATHS.CALENDAR, label: 'Calendar', icon: Calendar },
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 h-16 border-t z-50 flex justify-around items-center px-2 pb-safe backdrop-blur-xl",
      theme.surface,
      theme.border.default,
      "bg-opacity-90"
    )}>
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform",
              isActive ? theme.primary.text : theme.text.tertiary
            )}
          >
            <div className={cn("p-1 rounded-full", isActive ? theme.primary.light : "bg-transparent")}>
                <item.icon className={cn("h-5 w-5", isActive ? "" : "")} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
      
      <button
        onClick={onToggleSidebar}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform",
          theme.text.tertiary
        )}
      >
        <div className="p-1">
            <Menu className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </div>
  );
};
