import React from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { User as UserType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useWindow } from '../../context/WindowContext';
import { PATHS } from '../../constants/paths';
import { UserAvatar } from '../common/UserAvatar';

interface SidebarFooterProps {
  currentUser: UserType;
  onSwitchUser: () => void;
  onNavigate: (path: string) => void;
  activeView: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ currentUser, onSwitchUser, onNavigate, activeView }) => {
  const { theme } = useTheme();
  const { isOrbitalEnabled, toggleOrbitalMode } = useWindow();

  return (
    <div className={cn("p-4 border-t shrink-0 bg-slate-50/50", theme.border.default)}>
      <div className="mb-4 flex items-center justify-between px-1">
          <span className={cn("text-xs font-bold text-slate-400 uppercase tracking-wide")}>Holographic Mode</span>
          <button 
            onClick={toggleOrbitalMode}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isOrbitalEnabled ? "bg-blue-600" : "bg-slate-300"
            )}
            title={isOrbitalEnabled ? "Windowed Interface" : "Flat Interface"}
          >
            <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", isOrbitalEnabled ? "translate-x-4" : "translate-x-0")} />
          </button>
      </div>

      <button 
        onClick={() => onNavigate(PATHS.PROFILE)}
        className={cn(
            "w-full flex items-center p-2 rounded-lg transition-colors group mb-3 border shadow-sm",
            activeView === PATHS.PROFILE ? theme.primary.light : theme.surface.default,
            theme.border.default,
            `hover:${theme.surface.highlight}`
        )}
      >
        <UserAvatar name={currentUser.name} size="sm" className="mr-3" indicatorStatus="online" />
        <div className="text-left flex-1 min-w-0">
          <p className={cn("text-xs font-bold truncate", theme.text.primary)}>{currentUser.name}</p>
          <p className={cn("text--[10px] truncate font-medium", theme.text.secondary)}>{currentUser.role}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50", theme.text.tertiary)} />
      </button>
      
      <div className="grid grid-cols-2 gap-2">
         <button onClick={() => onNavigate(PATHS.ADMIN)} className={cn("h-8 px-2 text-xs font-medium rounded transition-colors flex items-center justify-center border", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.text.primary} hover:${theme.surface.highlight}`)}>
            <Settings className="h-3.5 w-3.5 mr-1.5"/> Settings
         </button>
         <button onClick={onSwitchUser} className={cn("h-8 px-2 text-xs font-medium rounded transition-colors flex items-center justify-center border", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.text.primary} hover:${theme.surface.highlight}`)}>
            <LogOut className="h-3.5 w-3.5 mr-1.5"/> Switch
         </button>
      </div>
    </div>
  );
};
