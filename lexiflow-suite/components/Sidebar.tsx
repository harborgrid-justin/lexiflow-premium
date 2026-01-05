
import React, { useMemo, useState, useTransition, useCallback } from 'react';
import { Scale, X, ChevronDown, Plus, Star, Clock, Briefcase, Pin } from 'lucide-react';
import { User as UserType, AppView, NavCategory } from '../types.ts';
import { NAVIGATION_ITEMS, NavItemConfig } from '../constants/navConfig.ts';
import { useTheme } from './providers/ThemeProvider.tsx';

interface SidebarProps {
  activeView: AppView; 
  setActiveView: (view: AppView) => void; 
  isOpen: boolean; 
  onClose: () => void;
  currentUser: UserType; 
  onSwitchUser: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, onClose, currentUser, onSwitchUser }) => {
  const [favorites, setFavorites] = useState<AppView[]>(['cases', 'billing', 'messages']);
  const { density } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleNavClick = useCallback((view: AppView) => {
    startTransition(() => {
        setActiveView(view);
        onClose(); 
    });
  }, [setActiveView, onClose]);

  const visibleItems = useMemo(() => {
    const isAuthorizedAdmin = currentUser.role === 'Administrator' || currentUser.role === 'Senior Partner';
    return NAVIGATION_ITEMS.filter(item => {
      if (item.requiresAdmin && !isAuthorizedAdmin) return false;
      return true;
    });
  }, [currentUser.role]);

  const groupedItems = useMemo(() => {
    const groups: Partial<Record<NavCategory, NavItemConfig[]>> = {};
    const categoryOrder: NavCategory[] = ['Main', 'Case Work', 'Litigation Tools', 'Operations', 'Knowledge', 'Admin'];
    
    categoryOrder.forEach(cat => groups[cat] = []);
    visibleItems.forEach(item => {
        if (groups[item.category]) groups[item.category]!.push(item);
    });

    return groups;
  }, [visibleItems]);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: AppView) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
  }, []);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden transition-all"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-72 text-slate-400 flex flex-col h-screen border-r transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto bg-[#0f172a] border-white/5`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/40 shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavClick('dashboard')}>
            <div className="p-2 rounded-xl shadow-lg bg-blue-600">
                <Scale className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">LexiFlow</h1>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mt-1 text-blue-400">Enterprise v3.6</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all"><X size={18}/></button>
        </div>

        <nav className={`flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            {favorites.length > 0 && (
                <div>
                    <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-3 flex items-center">
                        <Star size={10} className="mr-2 fill-amber-500/20 text-amber-500"/> Pinned
                    </h3>
                    <div className="space-y-0.5">
                        {visibleItems.filter(item => favorites.includes(item.id)).map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={`fav-${item.id}`}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${activeView === item.id ? 'bg-white/5 text-white shadow-inner' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-amber-500" />
                                    <span className="truncate">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {(Object.keys(groupedItems) as NavCategory[]).map(category => {
                const items = groupedItems[category];
                if (!items || items.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-3">
                            {category}
                        </h3>
                        <div className="space-y-0.5">
                            {items.map(item => {
                                const Icon = item.icon;
                                const isActive = activeView === item.id;
                                const isFav = favorites.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 group ${isActive ? 'text-white bg-blue-600 shadow-xl border border-blue-500/50' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
                                    >
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`} />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        <div 
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 ${isActive ? 'text-white' : 'text-slate-600'}`} 
                                            onClick={(e) => toggleFavorite(e, item.id)}
                                        >
                                            <Pin size={10} className={`${isFav ? 'fill-current text-amber-500' : ''}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-950/20 shrink-0">
          <button 
            onClick={onSwitchUser}
            className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
          >
            <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
            </div>
            <div className="ml-3 text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate tracking-tight">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 truncate font-semibold uppercase tracking-[0.2em] mt-0.5">{currentUser.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-600 group-hover:text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
