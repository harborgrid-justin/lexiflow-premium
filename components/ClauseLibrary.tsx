
import React, { useState, useMemo, useCallback } from 'react';
import { Book, BarChart3, Plus, Search, Star } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { TabNavigation } from './common/TabNavigation';
import { Button } from './common/Button';
import { Clause } from '../types';
import { ClauseList } from './clauses/ClauseList';
import { ClauseAnalytics } from './clauses/ClauseAnalytics';
import { ClauseHistoryModal } from './ClauseHistoryModal';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

type ClauseView = 'browse' | 'favorites' | 'analytics';

const PARENT_TABS = [
  {
    id: 'library', label: 'Library', icon: Book,
    subTabs: [
      { id: 'browse', label: 'All Clauses', icon: Search },
      { id: 'favorites', label: 'Favorites', icon: Star },
    ]
  },
  {
    id: 'insights', label: 'Insights', icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
    ]
  }
];

export const ClauseLibrary: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ClauseView>('browse');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as ClauseView);
    }
  }, []);

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      {selectedClause && (
        <ClauseHistoryModal clause={selectedClause} onClose={() => setSelectedClause(null)} />
      )}

      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Clause Library" 
          subtitle="Standardized legal text, risk ratings, and usage history."
          actions={
            <Button variant="primary" icon={Plus}>New Clause</Button>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as ClauseView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            {activeTab === 'browse' && <ClauseList onSelectClause={setSelectedClause} />}
            {activeTab === 'favorites' && (
                <div className={cn("flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed rounded-lg", theme.border.default, theme.text.tertiary)}>
                    <Star className="h-12 w-12 mb-4 opacity-20"/>
                    <p>No favorites saved yet.</p>
                </div>
            )}
            {activeTab === 'analytics' && <ClauseAnalytics />}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={cn("md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center p-2 z-40 pb-safe safe-area-inset-bottom", theme.surface, theme.border.default)}>
          {PARENT_TABS.map(parent => {
              const isActive = activeParentTab.id === parent.id;
              return (
                  <button 
                    key={parent.id} 
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-all",
                        isActive ? theme.primary.text : theme.text.tertiary
                    )}
                  >
                      <parent.icon className={cn("h-6 w-6 mb-1", isActive ? "fill-current opacity-20" : "")}/>
                      <span className="text-[10px] font-medium">{parent.label}</span>
                  </button>
              );
          })}
      </div>
    </div>
  );
};
