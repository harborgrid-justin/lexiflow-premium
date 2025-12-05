
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { User as UserType } from '../../types';
import { GlobalSearchResult } from '../../services/searchService';
import { IntentResult } from '../../services/geminiService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { ConnectivityHUD } from '../common/ConnectivityHUD';
import { NeuralCommandBar } from './NeuralCommandBar';

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
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center flex-1 gap-4">
        <button 
            onClick={onToggleSidebar} 
            className={cn("md:hidden p-2 -ml-2 rounded focus:outline-none", theme.text.secondary, `hover:${theme.surfaceHighlight}`)}
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

      <div className="flex items-center space-x-4 md:space-x-6">
        <ConnectivityHUD />
        <button className={cn("relative p-2 transition-colors", theme.text.tertiary, `hover:${theme.text.secondary}`)}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
        </button>
        <div 
            className={cn("flex items-center space-x-3 border-l pl-4 md:pl-6 cursor-pointer p-1 rounded transition-colors group", theme.border.default, `hover:${theme.surfaceHighlight}`)} 
            onClick={onSwitchUser}
            title="Switch User"
        >
            <div className="text-right hidden md:block">
                <p className={cn("text-sm font-semibold transition-colors", theme.text.primary, `group-hover:${theme.primary.text}`)}>{currentUser.name}</p>
                <p className={cn("text-xs", theme.text.secondary)}>{currentUser.role}</p>
            </div>
            <div className={cn("h-9 w-9 rounded-full flex items-center justify-center font-bold border shadow-sm transition-all", theme.primary.light, theme.primary.text, theme.primary.border)}>
                <span className="text-sm">{currentUser.name.substring(0,2).toUpperCase()}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
