
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { User as UserType } from '../../types';
import { GlobalSearchResult } from '../../services/searchService';
import { IntentResult } from '../../services/geminiService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { ConnectivityHUD } from '../common/ConnectivityHUD';
import { NeuralCommandBar } from './NeuralCommandBar';
import { UserAvatar } from '../common/UserAvatar';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onGlobalSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  currentUser: UserType;
  onSwitchUser: () => void;
  onSearchResultClick?: (result: GlobalSearchResult) => void;
  onNeuralCommand?: (intent: IntentResult) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onToggleSidebar, globalSearch, setGlobalSearch, onGlobalSearch, currentUser, onSwitchUser, onSearchResultClick, onNeuralCommand 
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex items-center justify-between h-full">
      <div className="flex items-center flex-1 gap-4">
        <button 
            onClick={onToggleSidebar} 
            className={cn("md:hidden p-2 -ml-2 rounded-lg focus:outline-none transition-colors", theme.text.secondary, `hover:${theme.surfaceHighlight}`)}
        >
            <Menu className="h-6 w-6" />
        </button>
        
        <NeuralCommandBar 
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onGlobalSearch={onGlobalSearch}
            onSearchResultClick={onSearchResultClick}
            onNeuralCommand={onNeuralCommand}
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ConnectivityHUD />
        
        <button className={cn("relative p-2 rounded-lg transition-colors group", theme.text.tertiary, `hover:${theme.surfaceHighlight} hover:${theme.text.secondary}`)}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button 
            className={cn("flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg transition-colors group", `hover:${theme.surfaceHighlight}`)} 
            onClick={onSwitchUser}
            title="Switch User Profile"
        >
            <div className="text-right hidden md:block">
                <p className={cn("text-xs font-bold leading-tight", theme.text.primary)}>{currentUser.name}</p>
                <p className={cn("text-[10px] uppercase font-medium tracking-wide", theme.text.secondary)}>{currentUser.role}</p>
            </div>
            <UserAvatar name={currentUser.name} size="sm" className="shadow-sm" />
        </button>
      </div>
    </div>
  );
};
