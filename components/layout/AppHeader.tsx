
import React, { useState } from 'react';
import { Menu, Bell, PlusCircle, UserPlus, Clock, FileText } from 'lucide-react';
import { User as UserType } from '../../types';
import { GlobalSearchResult } from '../../services/searchService';
import { IntentResult } from '../../services/geminiService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { ConnectivityHUD } from '../common/ConnectivityHUD';
import { NeuralCommandBar } from './NeuralCommandBar';
import { UserAvatar } from '../common/UserAvatar';
import { useInterval } from '../../hooks/useInterval';
import { useClickOutside } from '../../hooks/useClickOutside';

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
  const [pulse, setPulse] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const quickActionRef = React.useRef<HTMLDivElement>(null);
  
  useClickOutside(quickActionRef, () => setIsQuickActionOpen(false));

  // System Heartbeat Visual
  useInterval(() => setPulse(p => !p), 2000);

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
        
        {/* System Heartbeat Dot - Desktop only */}
        <div className={cn("hidden lg:flex items-center gap-2 px-3 py-1 rounded border", theme.surface.highlight, theme.border.default)}>
             <div className={cn("w-2 h-2 rounded-full transition-opacity duration-1000", pulse ? "bg-green-400 opacity-100" : "bg-green-600 opacity-40")}></div>
             <span className={cn("text-[9px] font-mono uppercase tracking-widest", theme.text.tertiary)}>System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative" ref={quickActionRef}>
             <button 
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className={cn("flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all text-xs font-bold shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surfaceHighlight}`)}
             >
                 <PlusCircle className="h-4 w-4 text-blue-600"/> Quick Add
             </button>
             
             {isQuickActionOpen && (
                 <div className={cn("absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface.default, theme.border.default)}>
                     <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                         <Clock className="h-4 w-4 text-green-600"/> Log Time
                     </button>
                     <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                         <FileText className="h-4 w-4 text-blue-600"/> New Document
                     </button>
                     <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surfaceHighlight}`)}>
                         <UserPlus className="h-4 w-4 text-purple-600"/> New Client
                     </button>
                 </div>
             )}
        </div>

        <ConnectivityHUD />
        
        <button className={cn("relative p-2 rounded-lg transition-colors group", theme.text.tertiary, `hover:${theme.surfaceHighlight} hover:${theme.text.secondary}`)}>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
        </button>

        <div className={cn("h-8 w-px mx-1", theme.border.default)}></div>

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
